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

  if (pathname === "/landing") {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (accessValid || refreshValid) {
      const url = nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }

    const res = NextResponse.next();
    clearAuthCookies(res);
    return res;
  }

  if (!refreshValid) {
    const loginUrl = nextUrl.clone();
    loginUrl.pathname = "/login";

    const res = NextResponse.redirect(loginUrl);
    clearAuthCookies(res);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 아래 경로들을 제외한 모든 요청 경로에 대해 미들웨어 실행:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - 모든 확장자 파일 (png, jpg, svg 등)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|map|txt|webp|woff2?)$).*)",
  ],
};
