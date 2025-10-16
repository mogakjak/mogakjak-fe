// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("mg_access_token")?.value;
  const pathname = req.nextUrl.pathname;

  // OAuth 콜백은 항상 통과시킴 (토큰 유무와 무관)
  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (token) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
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
