/**
 * 온보딩 완료 시 초대 리다이렉트 로직 테스트
 */

import { getOnboardingRedirectPath } from "../app/_lib/invite/inviteRedirectLogic";

const ONBOARDING_KEY = "mg_onboarded_v1";
const PENDING_INVITE_KEY = "mg_invite_groupid";

describe("온보딩 완료 시 초대 리다이렉트 (getOnboardingRedirectPath)", () => {
  let sessionStore: Record<string, string>;
  let localStore: Record<string, string>;

  beforeEach(() => {
    sessionStore = {};
    localStore = {};

    Object.defineProperty(global, "sessionStorage", {
      value: {
        getItem: (key: string) => sessionStore[key] ?? null,
        setItem: (key: string, val: string) => { sessionStore[key] = val; },
        removeItem: (key: string) => { delete sessionStore[key]; },
      },
      writable: true,
    });

    Object.defineProperty(global, "localStorage", {
      value: {
        getItem: (key: string) => localStore[key] ?? null,
        setItem: (key: string, val: string) => { localStore[key] = val; },
        removeItem: (key: string) => { delete localStore[key]; },
      },
      writable: true,
    });

    // document.cookie 모킹 (pendingInvite에서 사용)
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  it("온보딩 완료 시, 저장된 초대 groupId가 있으면 /invite/[id] 경로를 반환한다", () => {
    sessionStore[PENDING_INVITE_KEY] = "invite-group-456";

    const path = getOnboardingRedirectPath();

    expect(localStore[ONBOARDING_KEY]).toBe("true");
    expect(path).toBe("/invite/invite-group-456");
  });

  it("온보딩 완료 시, 초대 groupId가 sessionStorage에 없고 localStorage에 있으면 /invite/[id]를 반환한다", () => {
    localStore[PENDING_INVITE_KEY] = "local-group-789";

    const path = getOnboardingRedirectPath();

    expect(path).toBe("/invite/local-group-789");
  });

  it("온보딩 완료 시, 초대 groupId가 없으면 홈(/) 경로를 반환한다", () => {
    const path = getOnboardingRedirectPath();

    expect(localStore[ONBOARDING_KEY]).toBe("true");
    expect(path).toBe("/");
  });

  it("초대 ID 경로를 반환한 후에는 스토리지에서 pendingInvite를 제거한다", () => {
    sessionStore[PENDING_INVITE_KEY] = "to-remove-group";
    localStore[PENDING_INVITE_KEY] = "to-remove-group";

    getOnboardingRedirectPath();

    expect(sessionStore[PENDING_INVITE_KEY]).toBeUndefined();
    expect(localStore[PENDING_INVITE_KEY]).toBeUndefined();
  });
});
