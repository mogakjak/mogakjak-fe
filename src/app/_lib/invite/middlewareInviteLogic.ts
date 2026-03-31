import { isBot } from "@/app/_lib/userAgent";



export type InviteRedirectDecision =
  | { action: "redirect"; pathname: string; inviteParam: string }
  | { action: "next" };

/**
 * middleware.ts의 /invite 처리 블록을 순수 함수로 추출
 */
export function decideInviteAccess(
  pathname: string,
  accessValid: boolean,
  refreshValid: boolean,
  userAgent: string
): InviteRedirectDecision {
  if (!pathname.startsWith("/invite")) {
    return { action: "next" };
  }

  const isBotUser = isBot(userAgent);

  if (!accessValid && !refreshValid && !isBotUser) {
    const cleanPathname = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    const groupId = cleanPathname.substring(cleanPathname.lastIndexOf("/") + 1);

    if (groupId && groupId !== "invite") {
      return { action: "redirect", pathname: "/login", inviteParam: groupId };
    }
  }

  return { action: "next" };
}

/** 토큰 유효성 판단 (middleware.ts 21~22줄 로직) */
export function isTokenValid(token: string | null, expSeconds: number | null, nowSec: number): boolean {
  return !!token && expSeconds !== null && expSeconds > nowSec;
}
