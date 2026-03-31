import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getJwtExp } from "./app/_lib/getJwtExp";
import { decideInviteAccess, isTokenValid } from "./app/_lib/invite/middlewareInviteLogic";
import { isBot, isMobileDevice } from "./app/_lib/userAgent";

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

  const accessValid = isTokenValid(access, accessExp, nowSec);
  const refreshValid = isTokenValid(refresh, refreshExp, nowSec);

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

  if (pathname === "/agreements") {
    return NextResponse.next();
  }

  const userAgent = req.headers.get("user-agent") || "";
  const isBotUser = isBot(userAgent);
  const isMobile = isMobileDevice(userAgent);


  const decision = decideInviteAccess(pathname, accessValid, refreshValid, userAgent);

  if (decision.action === "redirect") {
    const loginUrl = nextUrl.clone();
    loginUrl.pathname = decision.pathname;
    loginUrl.searchParams.set("invite", decision.inviteParam);

    const res = NextResponse.redirect(loginUrl);
    clearAuthCookies(res);
    return res;
  }

  if (pathname.startsWith("/invite")) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    const isDeactivated = nextUrl.searchParams.get("deactivated") === "true";

    if (isDeactivated) {
      const res = NextResponse.next();
      clearAuthCookies(res);
      return res;
    }

    if (accessValid || refreshValid) {
      const url = nextUrl.clone();
      url.pathname = isMobile ? "/landing" : "/";
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

  if (pathname === "/" && isMobile && !isBotUser) {

    const url = nextUrl.clone();
    url.pathname = "/landing";
    return NextResponse.redirect(url);
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
