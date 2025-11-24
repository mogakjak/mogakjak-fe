import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE = process.env.NEXT_PUBLIC_API_PROXY || "https://mogakjak.site";
const secure = process.env.NODE_ENV === "production";

const cookieOpts = {
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
};

// 새 응답 스펙에 맞춘 타입
interface RefreshResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    userInfo: {
      email: string;
      name: string;
      userId: string;
      tokenType: string;
      expiresIn: number; // accessToken 유효기간 (ms or s는 백엔드 기준)
    };
  };
}

function extractAccessToken(headers: Headers): string | undefined {
  const auth = headers.get("authorization");
  if (auth && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7);
  }

  const alt =
    headers.get("access-token") ||
    headers.get("x-access-token") ||
    headers.get("x-auth-token");

  return alt ?? undefined;
}

function clearAuthCookies(res: NextResponse) {
  res.cookies.set("mg_access_token", "", { ...cookieOpts, maxAge: 0 });
  res.cookies.set("mg_refresh_token", "", { ...cookieOpts, maxAge: 0 });
}

/**
 * /auth/refresh 호출해서 새 access/refresh token + expiresIn 받아오기
 */
async function refreshAccessToken(
  refreshToken: string,
  accessToken?: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
} | null> {
  try {
    const headers: Record<string, string> = {
      accept: "application/json",
      "Refresh-Token": refreshToken,
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const upstream = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers,
      cache: "no-store",
    });

    if (!upstream.ok) {
      console.error(
        `[Token Refresh] 서버 응답 실패: ${upstream.status} ${upstream.statusText}`
      );
      return null;
    }

    // 1차: body에서 accessToken/refreshToken/expiresIn 읽기
    const result = (await upstream.json()) as
      | RefreshResponse
      | {
          data?: {
            accessToken?: string;
            refreshToken?: string;
            userInfo?: {
              expiresIn?: number;
            };
          };
        };

    const bodyAccessToken: string | undefined = result?.data?.accessToken;
    const bodyRefreshToken: string | undefined = result?.data?.refreshToken;
    const expiresInRaw: unknown = result?.data?.userInfo?.expiresIn;

    // 2차: 혹시 헤더에도 토큰이 있다면 fallback로 사용
    const headerAccessToken = extractAccessToken(upstream.headers);

    const finalAccessToken = bodyAccessToken || headerAccessToken;
    const expiresIn =
      typeof expiresInRaw === "number" && expiresInRaw > 0 ? expiresInRaw : 0;

    if (!finalAccessToken || expiresIn <= 0) {
      console.error(
        `[Token Refresh] 토큰 추출 실패: accessToken=${!!finalAccessToken}, expiresIn=${expiresIn}`
      );
      return null;
    }

    return {
      accessToken: finalAccessToken,
      refreshToken: bodyRefreshToken,
      expiresIn,
    };
  } catch (error) {
    console.error("[Token Refresh] 예외 발생:", error);
    return null;
  }
}

function buildTargetUrl(path: string[] | undefined, req: NextRequest) {
  const joined = (path ?? []).join("/");
  const search = req.nextUrl.search || "";
  return `${API_BASE}/api/${joined}${search}`;
}

async function proxy(
  method: string,
  req: NextRequest,
  path?: string[],
  isRetry = false
): Promise<NextResponse> {
  const accessTokenCookie = req.cookies.get("mg_access_token")?.value ?? null;
  const refreshToken = req.cookies.get("mg_refresh_token")?.value ?? null;

  const url = buildTargetUrl(path, req);

  // 자기 자신으로 다시 프록시 타는 경우 방지
  if (url.startsWith(`${req.nextUrl.origin}/api/`)) {
    return NextResponse.json({ message: "Bad proxy config" }, { status: 500 });
  }

  const headers = new Headers(req.headers);
  headers.set("accept", "application/json");

  if (!headers.has("content-type") && method !== "GET" && method !== "HEAD") {
    headers.set("content-type", "application/json");
  }

  headers.delete("host");
  headers.delete("content-length");

  if (accessTokenCookie) {
    headers.set("authorization", `Bearer ${accessTokenCookie}`);
  }

  const hasBody = !(method === "GET" || method === "HEAD");
  const body = hasBody ? await req.text() : undefined;

  const upstream = await fetch(url, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  // 401 + refresh token 있으면 한 번만 리프레시 시도
  if (upstream.status === 401 && refreshToken && !isRetry) {
    const refreshResult = await refreshAccessToken(
      refreshToken,
      accessTokenCookie || undefined
    );

    if (refreshResult) {
      // 새 토큰으로 재시도
      const retryHeaders = new Headers(headers);
      retryHeaders.set("authorization", `Bearer ${refreshResult.accessToken}`);

      const retryResponse = await fetch(url, {
        method,
        headers: retryHeaders,
        body,
        cache: "no-store",
      });

      const retryText = await retryResponse.text();
      const retryContentType =
        retryResponse.headers.get("content-type") ?? "application/json";

      const resp = new NextResponse(retryText, {
        status: retryResponse.status,
        headers: { "content-type": retryContentType },
      });

      //  새 access token 쿠키 저장
      resp.cookies.set("mg_access_token", refreshResult.accessToken, {
        ...cookieOpts,
        maxAge: refreshResult.expiresIn,
      });

      //  새 refresh token도 오면 같이 갱신
      if (refreshResult.refreshToken) {
        resp.cookies.set("mg_refresh_token", refreshResult.refreshToken, {
          ...cookieOpts,
          // refresh 토큰 만료시간은 백엔드 정책에 따라 다를 수 있음
          // 여기서는 accessToken과 동일하게 두거나, 별도 값 쓰도록 백엔드와 맞추면 됨
          maxAge: refreshResult.expiresIn,
        });
      }

      return resp;
    } else {
      // refresh 실패 → 쿠키 정리만 하고 원래 401 그대로 보냄
      const text = await upstream.text();
      const contentType =
        upstream.headers.get("content-type") ?? "application/json";

      const resp = new NextResponse(text, {
        status: upstream.status,
        headers: { "content-type": contentType },
      });

      clearAuthCookies(resp);
      return resp;
    }
  }

  // 그냥 바로 응답 전달
  const text = await upstream.text();
  const contentType =
    upstream.headers.get("content-type") ?? "application/json";

  const resp = new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": contentType },
  });

  // 401이면 쿠키만 정리
  if (upstream.status === 401) {
    clearAuthCookies(resp);
  }

  return resp;
}

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy("GET", req, path);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy("POST", req, path);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy("PATCH", req, path);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy("PUT", req, path);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy("DELETE", req, path);
}
