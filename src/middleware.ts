import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("mg_access_token")?.value;
  const refresh = req.cookies.get("mg_refresh_token")?.value;
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // OAuth 콜백은 항상 통과시킴 (토큰 유무와 무관)
  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (token) {
      const url = nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!token) {
    if (refresh) {
      const url = nextUrl.clone();
      url.pathname = "/auth/refresh";
      const redirectTo = pathname + nextUrl.search;
      url.search = `redirectTo=${encodeURIComponent(redirectTo)}`;
      return NextResponse.redirect(url);
    }

    const loginUrl = nextUrl.clone();
    loginUrl.pathname = "/login";
    const redirectTo = pathname + nextUrl.search;
    loginUrl.search = `redirectTo=${encodeURIComponent(redirectTo)}`;
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
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
