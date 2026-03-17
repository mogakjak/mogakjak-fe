import { decideInviteAccess } from "../app/_lib/invite/middlewareInviteLogic";
import { 
  processInviteParam, 
  getOnboardingRedirectPath,
  isJoinGroupUnauthorized,
  isJoinGroupAlreadyMember
} from "../app/_lib/invite/inviteRedirectLogic";

/**
 * 비회원 초대링크 플로우 통합 테스트
 */

const PENDING_INVITE_KEY = "mg_invite_groupid";
const ONBOARDING_KEY = "mg_onboarded_v1";

describe("비회원 초대링크 전체 플로우 (실제 로직 사용)", () => {

  beforeEach(() => {
    // Storage 초기화
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "";

    // window.location.replace 모킹은 실제 환경에서는 어려우므로 콜백으로 처리하거나 수동 검증
  });

  // ────────────── 1단계: 미들웨어 ──────────────
  describe("[1단계] 미들웨어 - /invite/[id] 접근 시 /login?invite=[id] 리다이렉트 결정", () => {
    it("비회원이 /invite/[groupId] 접근 시 /login 리다이렉트를 결정해야 한다", () => {
      const result = decideInviteAccess("/invite/abc-123", false, false, "Mozilla/5.0");
      expect(result.action).toBe("redirect");
      if (result.action === "redirect") {
        expect(result.pathname).toBe("/login");
        expect(result.inviteParam).toBe("abc-123");
      }
    });

    it("trailing slash가 있어도 groupId를 올바르게 추출한다", () => {
      const result = decideInviteAccess("/invite/abc-123/", false, false, "Mozilla/5.0");
      if (result.action === "redirect") {
        expect(result.inviteParam).toBe("abc-123");
      }
    });

    it("봇은 리다이렉트하지 않는다", () => {
      const result = decideInviteAccess("/invite/abc-123", false, false, "Googlebot");
      expect(result.action).toBe("next");
    });
  });

  // ────────────── 2단계: 로그인 페이지 ──────────────
  describe("[2단계] processInviteParam - ?invite=[id] 파라미터를 스토리지에 저장", () => {
    it("invite 파라미터를 스토리지에 저장한다", () => {
      const params = new URLSearchParams("invite=group-xyz");
      processInviteParam(params);
      
      expect(localStorage.getItem(PENDING_INVITE_KEY)).toBe("group-xyz");
      expect(sessionStorage.getItem(PENDING_INVITE_KEY)).toBe("group-xyz");
    });
  });

  // ────────────── 3단계: 온보딩 완료 ──────────────
  describe("[3단계] getOnboardingRedirectPath - 저장된 inviteId로 경로 결정", () => {
    it("온보딩 완료 시 초대 ID가 있으면 해당 페이지로 리다이렉트 경로를 반환한다", () => {
      localStorage.setItem(PENDING_INVITE_KEY, "group-xyz");
      
      const path = getOnboardingRedirectPath();
      
      expect(path).toBe("/invite/group-xyz");
      expect(localStorage.getItem(ONBOARDING_KEY)).toBe("true");
      // 사용 후 제거 확인
      expect(localStorage.getItem(PENDING_INVITE_KEY)).toBeNull();
    });

    it("초대 ID가 없으면 홈(/)을 반환한다", () => {
      const path = getOnboardingRedirectPath();
      expect(path).toBe("/");
      expect(localStorage.getItem(ONBOARDING_KEY)).toBe("true");
    });
  });

  // ────────────── 4단계: InvitePageClient ──────────────
  describe("[4단계] InvitePageClient 관련 로직 (오류 판단)", () => {
    it("401 오류는 권한 부족으로 판단한다", () => {
      const err = new Error("Unauthorized");
      expect(isJoinGroupUnauthorized(err)).toBe(true);
    });

    it("409 오류는 이미 멤버임으로 판단한다", () => {
      const err = Object.assign(new Error("Conflict"), { status: 409 });
      expect(isJoinGroupAlreadyMember(err)).toBe(true);
    });
  });

  // ────────────── 전체 시뮬레이션 ──────────────
  describe("[통합] 전체 시나리오", () => {
    it("비회원 접근 → 로그인 → 온보딩 완료 시나리오가 실제 함수들로 연동된다", () => {
      const path = "/invite/test-777";
      
      // 1. 미들웨어 판단
      const decision = decideInviteAccess(path, false, false, "Mozilla");
      expect(decision.action).toBe("redirect");
      
      if (decision.action === "redirect") {
        // 2. 로그인 페이지에서 파라미터 처리
        const searchParams = new URLSearchParams(`invite=${decision.inviteParam}`);
        processInviteParam(searchParams);
        
        expect(localStorage.getItem(PENDING_INVITE_KEY)).toBe("test-777");
        
        // 3. 온보딩 완료 후 리다이렉트
        const nextPath = getOnboardingRedirectPath();
        expect(nextPath).toBe("/invite/test-777");
        expect(localStorage.getItem(PENDING_INVITE_KEY)).toBeNull();
      }
    });
  });
});
