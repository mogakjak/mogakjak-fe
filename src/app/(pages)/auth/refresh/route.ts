import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE = process.env.API_BASE_URL!;
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

function extractAccessToken(headers: Headers): string | undefined {
  const auth = headers.get("authorization");
  if (auth && auth.toLowerCase().startsWith("bearer ")) return auth.slice(7);
  const alt =
    headers.get("access-token") ||
    headers.get("x-access-token") ||
    headers.get("x-auth-token");
  return alt ?? undefined;
}

export async function POST() {
  const store = await cookies();
  const refresh = store.get("mg_refresh_token")?.value;
  const baseRes = NextResponse.json({ ok: false });

  if (!refresh) {
    clearAll(baseRes);
    return NextResponse.json(
      { error: "no_refresh" },
      { status: 401, headers: baseRes.headers }
    );
  }

  const upstream = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    clearAll(baseRes);
    return NextResponse.json(
      { error: "refresh_failed" },
      { status: 401, headers: baseRes.headers }
    );
  }

  const accessToken = extractAccessToken(upstream.headers);
  const result = (await upstream.json()) as RefreshResponse;
  const expiresInSec = result?.data?.expiresIn;

  if (!accessToken || typeof expiresInSec !== "number" || expiresInSec <= 0) {
    clearAll(baseRes);
    return NextResponse.json(
      { error: "missing_token" },
      { status: 502, headers: baseRes.headers }
    );
  }

  baseRes.cookies.set("mg_access_token", accessToken, {
    ...cookieOpts,
    maxAge: expiresInSec,
  });
  return NextResponse.json(
    { ok: true },
    { status: 200, headers: baseRes.headers }
  );
}

// 미들웨어에서 사용: access 토큰이 없고 refresh 토큰이 있을 때 갱신 후 원래 페이지로 리다이렉트
export async function GET(req: NextRequest) {
  const redirectTo = req.nextUrl.searchParams.get("redirectTo") ?? "/";

  const store = await cookies();
  const refresh = store.get("mg_refresh_token")?.value;

  if (!refresh) {
    // refresh가 없으면 로그인으로
    const login = new URL(`/login?redirectTo=${encodeURIComponent(redirectTo)}`, req.url);
    const res = NextResponse.redirect(login, { status: 302 });
    clearAll(res);
    return res;
  }

  const upstream = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    const login = new URL(`/login?redirectTo=${encodeURIComponent(redirectTo)}`, req.url);
    const res = NextResponse.redirect(login, { status: 302 });
    clearAll(res);
    return res;
  }

  const accessToken = extractAccessToken(upstream.headers);
  const result = (await upstream.json()) as RefreshResponse;
  const expiresInSec = result?.data?.expiresIn;

  if (!accessToken || typeof expiresInSec !== "number" || expiresInSec <= 0) {
    const login = new URL(`/login?redirectTo=${encodeURIComponent(redirectTo)}`, req.url);
    const res = NextResponse.redirect(login, { status: 302 });
    clearAll(res);
    return res;
  }

  const res = NextResponse.redirect(new URL(redirectTo, req.url), { status: 302 });
  res.cookies.set("mg_access_token", accessToken, {
    ...cookieOpts,
    maxAge: expiresInSec,
  });
  return res;
}
