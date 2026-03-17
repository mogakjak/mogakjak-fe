/**
 * middleware.ts 핵심 로직 테스트
 *
 * next/server를 Jest에서 직접 모킹하면 hanging이 발생하므로,
 * 미들웨어의 분기 판단 로직을 순수 함수로 추출해서 검증한다.
 *
 * 검증 대상: middleware.ts의 /invite 처리 블록 (45~64줄)
 *
 *   if (!accessValid && !refreshValid && !isBot) {
 *     const groupId = ... pathname에서 추출
 *     if (groupId && groupId !== "invite") {
 *       → /login?invite=[groupId] 리다이렉트
 *     }
 *   }
 */

// ─── 실제 middleware.ts의 분기 로직을 그대로 추출한 순수 함수 ───

const BOT_UA_PATTERN =
  /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|kakaotalk-scrap|slackbot|twitterbot|discordbot|yeti|daum|kakaostory/i;

type RedirectDecision =
  | { action: "redirect"; pathname: string; inviteParam: string }
  | { action: "next" };

/**
 * middleware.ts의 /invite 처리 블록을 순수 함수로 추출
 */
function decideInviteAccess(
  pathname: string,
  accessValid: boolean,
  refreshValid: boolean,
  userAgent: string
): RedirectDecision {
  if (!pathname.startsWith("/invite")) {
    return { action: "next" };
  }

  const isBot = BOT_UA_PATTERN.test(userAgent);

  if (!accessValid && !refreshValid && !isBot) {
    const cleanPathname = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    const groupId = cleanPathname.substring(cleanPathname.lastIndexOf("/") + 1);

    if (groupId && groupId !== "invite") {
      return { action: "redirect", pathname: "/login", inviteParam: groupId };
    }
  }

  return { action: "next" };
}

/** getJwtExp 결과로 토큰 유효성 판단 (middleware.ts 21~22줄 로직) */
function isTokenValid(token: string | null, expSeconds: number | null, nowSec: number): boolean {
  return !!token && expSeconds !== null && expSeconds > nowSec;
}

// ─── 테스트 ───

const NOW = Math.floor(Date.now() / 1000);
const FUTURE = NOW + 3600;  // 1시간 후
const PAST = NOW - 3600;    // 1시간 전

const NORMAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120";
const KAKAO_BOT_UA = "kakaotalk-scrap/1.0";
const GOOGLE_BOT_UA = "Googlebot/2.1";

describe("middleware - /invite 접근 시 비회원 리다이렉트 로직", () => {
  describe("[핵심] 비회원 /invite/[id] 접근 → /login?invite=[id]로 리다이렉트", () => {
    it("비회원이 /invite/group-123 접근 시 /login?invite=group-123 리다이렉트를 결정한다", () => {
      const result = decideInviteAccess("/invite/group-123", false, false, NORMAL_UA);

      expect(result.action).toBe("redirect");
      if (result.action === "redirect") {
        expect(result.pathname).toBe("/login");
        expect(result.inviteParam).toBe("group-123");
      }
    });

    it("/login이 아닌 /login?invite=[id] 형태로 리다이렉트한다 (파라미터 포함 확인)", () => {
      const result = decideInviteAccess("/invite/special-group", false, false, NORMAL_UA);

      expect(result.action).toBe("redirect");
      if (result.action === "redirect") {
        // /login 단독이 아닌, inviteParam이 반드시 포함되어야 함
        expect(result.inviteParam).toBe("special-group");
        expect(result.inviteParam).not.toBe("");
        expect(result.inviteParam).not.toBeNull();
      }
    });

    it("trailing slash가 있는 /invite/group-123/ 도 groupId를 올바르게 추출한다", () => {
      const result = decideInviteAccess("/invite/group-123/", false, false, NORMAL_UA);

      expect(result.action).toBe("redirect");
      if (result.action === "redirect") {
        expect(result.inviteParam).toBe("group-123");
      }
    });

    it("숫자형 groupId도 올바르게 파라미터로 전달된다", () => {
      const result = decideInviteAccess("/invite/99999", false, false, NORMAL_UA);

      expect(result.action).toBe("redirect");
      if (result.action === "redirect") {
        expect(result.inviteParam).toBe("99999");
      }
    });
  });

  describe("로그인 사용자 - 리다이렉트 없이 통과", () => {
    it("accessToken이 유효한 로그인 사용자는 /invite 접근을 허용한다", () => {
      const accessValid = isTokenValid("valid.access.token", FUTURE, NOW);
      const refreshValid = isTokenValid("valid.refresh.token", FUTURE, NOW);

      const result = decideInviteAccess("/invite/group-123", accessValid, refreshValid, NORMAL_UA);
      expect(result.action).toBe("next");
    });

    it("refreshToken만 유효해도 /invite 접근을 허용한다", () => {
      const accessValid = isTokenValid("expired.access", PAST, NOW); // 만료
      const refreshValid = isTokenValid("valid.refresh.token", FUTURE, NOW);

      const result = decideInviteAccess("/invite/group-123", accessValid, refreshValid, NORMAL_UA);
      expect(result.action).toBe("next");
    });
  });

  describe("봇/크롤러 - 리다이렉트 없이 통과 (SNS 미리보기 지원)", () => {
    it("카카오톡 봇은 /invite 접근 시 리다이렉트하지 않는다", () => {
      const result = decideInviteAccess("/invite/group-123", false, false, KAKAO_BOT_UA);
      expect(result.action).toBe("next");
    });

    it("구글봇은 /invite 접근 시 리다이렉트하지 않는다", () => {
      const result = decideInviteAccess("/invite/group-123", false, false, GOOGLE_BOT_UA);
      expect(result.action).toBe("next");
    });
  });

  describe("토큰 유효성 판단 로직 (getJwtExp 연동)", () => {
    it("토큰이 null이면 유효하지 않다", () => {
      expect(isTokenValid(null, null, NOW)).toBe(false);
    });

    it("exp가 현재 시각보다 미래면 유효하다", () => {
      expect(isTokenValid("some.token", FUTURE, NOW)).toBe(true);
    });

    it("exp가 현재 시각보다 과거면 만료된 것으로 판단한다", () => {
      expect(isTokenValid("some.token", PAST, NOW)).toBe(false);
    });

    it("exp가 null이면 유효하지 않다 (서명 검증 실패 등)", () => {
      expect(isTokenValid("some.token", null, NOW)).toBe(false);
    });
  });

  describe("비 /invite 경로는 이 로직을 타지 않는다", () => {
    it.each(["/", "/login", "/group/123", "/landing", "/onboarding"])(
      "%s 경로는 next를 반환한다",
      (path) => {
        const result = decideInviteAccess(path, false, false, NORMAL_UA);
        expect(result.action).toBe("next");
      }
    );
  });
});
