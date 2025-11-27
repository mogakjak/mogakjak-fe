import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getJwtExp(token?: string): number | undefined {
  try {
    if (!token) return;
    const [, payload] = token.split(".");
    const json = Buffer.from(payload, "base64").toString("utf8");
    const data = JSON.parse(json);
    if (typeof data?.exp === "number") return data.exp;
  } catch { }
}

interface JwtPayload {
  isOnboarding?: boolean;
  [key: string]: unknown;
}

function getJwtPayload(token?: string): JwtPayload | null {
  try {
    if (!token) return null;
    const [, payload] = token.split(".");
    const json = Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const accessTokenParam =
    searchParams.get("accessToken") || searchParams.get("access_token");
  const refreshTokenParam =
    searchParams.get("refreshToken") || searchParams.get("refresh_token");

  if (!accessTokenParam || !refreshTokenParam) {
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "missing_token");
    return NextResponse.redirect(url);
  }

  const accessToken = accessTokenParam;
  const refreshToken = refreshTokenParam;

  const nowSec = Math.floor(Date.now() / 1000);
  const accessExp = getJwtExp(accessToken);
  const refreshExp = getJwtExp(refreshToken);

  const accessMaxAge = accessExp ? Math.max(accessExp - nowSec, 0) : 60 * 60; // 1h
  const refreshMaxAge = refreshExp
    ? Math.max(refreshExp - nowSec, 0)
    : 60 * 60 * 24 * 14; // 14d

  const cookieStore = await cookies();

  cookieStore.set("mg_access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });

  cookieStore.set("mg_refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: refreshMaxAge,
  });

  const payload = getJwtPayload(accessToken);
  const isOnboarding = payload?.isOnboarding ?? true;

  const redirectUrl = new URL(isOnboarding ? "/" : "/onboarding", req.url);
  return NextResponse.redirect(redirectUrl);
}
