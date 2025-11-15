import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getJwtExp } from "./app/_lib/getJwtExp";

function clearAuthCookies(res: NextResponse) {
  res.cookies.set("mg_access_token", "", { path: "/", maxAge: 0 });
  res.cookies.set("mg_refresh_token", "", { path: "/", maxAge: 0 });
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const access = req.cookies.get("mg_access_token")?.value ?? null;
  const refresh = req.cookies.get("mg_refresh_token")?.value ?? null;

  const nowSec = Math.floor(Date.now() / 1000);
  const accessExp = getJwtExp(access);
  const refreshExp = getJwtExp(refresh);

  const accessValid = !!access && accessExp !== null && accessExp > nowSec;
  const refreshValid = !!refresh && refreshExp !== null && refreshExp > nowSec;

  // API/정적 리소스 pass
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|map|txt|webp|woff2?)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (accessValid) {
      const url = nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }

    const res = NextResponse.next();
    if (!refreshValid) {
      clearAuthCookies(res);
    }
    return res;
  }

  // 유효할 시에
  if (accessValid) {
    return NextResponse.next();
  }

  // 리프레쉬도 만료 시에는 둘 다 삭제 후 로그인
  if (!refreshValid) {
    const loginUrl = nextUrl.clone();
    loginUrl.pathname = "/login";

    const res = NextResponse.redirect(loginUrl);
    clearAuthCookies(res);
    return res;
  }

  // refresh는 만료가 안되었으면 리프레쉬 시도
  const refreshUrl = nextUrl.clone();
  refreshUrl.pathname = "/auth/refresh";
  return NextResponse.redirect(refreshUrl);
}

export const config = {
  matcher: [
    "/login",
    "/auth/callback/:path*",
    "/",
    "/dashboard/:path*",
    "/rooms/:path*",
  ],
};
