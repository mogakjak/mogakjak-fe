import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "../auth/token/tokenRefresh";
import { clearAuthCookies, cookieOpts } from "../../_utils/clearCookies";
import { RefreshTokenResult } from "../../_types/refresh";

const API_BASE = process.env.NEXT_PUBLIC_API_PROXY || "https://mogakjak.site";

function buildTargetUrl(path: string[] | undefined, req: NextRequest) {
  const joined = (path ?? []).join("/");
  const search = req.nextUrl.search || "";
  return `${API_BASE}/api/${joined}${search}`;
}

function setAuthCookies(resp: NextResponse, refreshResult: RefreshTokenResult) {
  resp.cookies.set("mg_access_token", refreshResult.accessToken, {
    ...cookieOpts,
    maxAge: refreshResult.expiresIn,
  });

  if (refreshResult.refreshToken) {
    resp.cookies.set("mg_refresh_token", refreshResult.refreshToken, {
      ...cookieOpts,

      maxAge: refreshResult.expiresIn,
    });
  }
}

export async function proxy(
  method: string,
  req: NextRequest,
  path?: string[],
  isRetry = false
): Promise<NextResponse> {
  const accessTokenCookie = req.cookies.get("mg_access_token")?.value ?? null;
  const refreshToken = req.cookies.get("mg_refresh_token")?.value ?? null;

  const url = buildTargetUrl(path, req);

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

      setAuthCookies(resp, refreshResult);
      return resp;
    } else {
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
