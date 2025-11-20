import { NextRequest, NextResponse } from "next/server";
import { getJwtExp } from "@/app/_lib/getJwtExp";

export const runtime = "nodejs";

const API_BASE = process.env.NEXT_PUBLIC_API_PROXY || "https://mogakjak.site";
const secure = process.env.NODE_ENV === "production";
const cookieOpts = {
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
};

interface RefreshResponse {
  statusCode: number;
  message: string;
  data: {
    email: string;
    name: string;
    userId: string;
    tokenType: string;
    expiresIn: number;
  };
}

function clearAll(res: NextResponse) {
  res.cookies.set("mg_access_token", "", { ...cookieOpts, maxAge: 0 });
  res.cookies.set("mg_refresh_token", "", { ...cookieOpts, maxAge: 0 });
}

function redirectToLogin(
  req: NextRequest,
  targetUrl: string,
  reason: "refresh_expired" | "unauthorized"
) {
  const loginUrl = new URL("/login", req.url);
  const res = NextResponse.redirect(loginUrl);
  clearAll(res);
  res.headers.set("x-proxy-hit", "true");
  res.headers.set("x-proxy-url", targetUrl);
  res.headers.set("x-proxy-auth", reason);
  return res;
}

function extractAccessToken(headers: Headers): string | undefined {
  const auth = headers.get("authorization");
  if (auth && auth.toLowerCase().startsWith("bearer ")) return auth.slice(7);
  const alt =
    headers.get("access-token") ||
    headers.get("x-access-token") ||
    headers.get("x-auth-token");
  return alt ?? undefined;
}

async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number } | null> {
  try {
    const upstream = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return null;
    }

    const accessToken = extractAccessToken(upstream.headers);
    const result = (await upstream.json()) as RefreshResponse;
    const expiresInSec = result?.data?.expiresIn;

    if (!accessToken || typeof expiresInSec !== "number" || expiresInSec <= 0) {
      return null;
    }

    return { accessToken, expiresIn: expiresInSec };
  } catch {
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
  path: string[] | undefined,
  retryCount = 0
): Promise<NextResponse> {
  const token = req.cookies.get("mg_access_token")?.value ?? null;
  const refreshToken = req.cookies.get("mg_refresh_token")?.value ?? null;
  const url = buildTargetUrl(path, req);
  const nowSec = Math.floor(Date.now() / 1000);
  const refreshExp = getJwtExp(refreshToken);
  const refreshExpired =
    !refreshToken || refreshExp === null || refreshExp <= nowSec;

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
  if (token) headers.set("authorization", `Bearer ${token}`);

  const hasBody = !(method === "GET" || method === "HEAD");
  const body = hasBody ? await req.text() : undefined;

  const upstream = await fetch(url, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  if (upstream.status === 401 && refreshToken && retryCount === 0) {
    const refreshResult = await refreshAccessToken(refreshToken);

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

      resp.cookies.set("mg_access_token", refreshResult.accessToken, {
        ...cookieOpts,
        maxAge: refreshResult.expiresIn,
      });

      resp.headers.set("x-proxy-hit", "true");
      resp.headers.set("x-proxy-url", url);
      resp.headers.set("x-proxy-auth", "refreshed");
      return resp;
    } else if (refreshExpired) {
      return redirectToLogin(req, url, "refresh_expired");
    } else {
      const text = await upstream.text();
      const contentType =
        upstream.headers.get("content-type") ?? "application/json";
      const resp = new NextResponse(text, {
        status: upstream.status,
        headers: { "content-type": contentType },
      });
      clearAll(resp);
      resp.headers.set("x-proxy-hit", "true");
      resp.headers.set("x-proxy-url", url);
      resp.headers.set("x-proxy-auth", "refresh_failed");
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

  resp.headers.set("x-proxy-hit", "true");
  resp.headers.set("x-proxy-url", url);
  resp.headers.set("x-proxy-auth", token ? "present" : "missing");

  if (upstream.status === 401) {
    clearAll(resp);
    if (refreshExpired) {
      return redirectToLogin(req, url, "unauthorized");
    }
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
