/**
 * 온보딩 완료 시 초대 리다이렉트 로직 테스트
 * onboarding/page.tsx 의 handleFinalModalClose 핵심 로직을 분리해서 검증
 *
 * 검증 시나리오:
 * 1. 온보딩 완료 + 초대 ID 있음 → /invite/[id] 로 이동
 * 2. 온보딩 완료 + 초대 ID 없음 → / 홈으로 이동
 */

const ONBOARDING_KEY = "mg_onboarded_v1";
const PENDING_INVITE_KEY = "mg_invite_groupid";

/** handleFinalModalClose 핵심 로직을 그대로 추출한 함수 */
function handleFinalModalClose(
  router: { replace: (path: string) => void },
  queryClient: { invalidateQueries: (opts: object) => void }
) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ONBOARDING_KEY, "true");

    const inviteGroupId =
      sessionStorage.getItem(PENDING_INVITE_KEY) ||
      localStorage.getItem(PENDING_INVITE_KEY);

    if (inviteGroupId) {
      sessionStorage.removeItem(PENDING_INVITE_KEY);
      localStorage.removeItem(PENDING_INVITE_KEY);
      queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
      router.replace(`/invite/${inviteGroupId}`);
      return;
    }
  }

  queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
  router.replace("/");
}

describe("온보딩 완료 시 초대 리다이렉트 (handleFinalModalClose 로직)", () => {
  let sessionStore: Record<string, string>;
  let localStore: Record<string, string>;
  let mockRouter: { replace: jest.Mock };
  let mockQueryClient: { invalidateQueries: jest.Mock };

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

    mockRouter = { replace: jest.fn() };
    mockQueryClient = { invalidateQueries: jest.fn() };
  });

  it("[핵심] 온보딩 완료 시, 저장된 초대 groupId가 있으면 /invite/[id]로 이동한다", () => {
    // 비회원이 초대링크 클릭 → 로그인 페이지에서 저장된 pendingInvite
    sessionStore[PENDING_INVITE_KEY] = "invite-group-456";

    handleFinalModalClose(mockRouter, mockQueryClient);

    expect(localStore[ONBOARDING_KEY]).toBe("true");
    expect(mockRouter.replace).toHaveBeenCalledWith("/invite/invite-group-456");
    expect(mockRouter.replace).not.toHaveBeenCalledWith("/");
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["onboarding-status"],
    });
  });

  it("[핵심] 온보딩 완료 시, 초대 groupId가 sessionStorage에 없고 localStorage에 있으면 /invite/[id]로 이동한다", () => {
    // sessionStorage는 비어있고 localStorage에만 저장된 경우
    localStore[PENDING_INVITE_KEY] = "local-group-789";

    handleFinalModalClose(mockRouter, mockQueryClient);

    expect(mockRouter.replace).toHaveBeenCalledWith("/invite/local-group-789");
  });

  it("온보딩 완료 시, 초대 groupId가 없으면 홈(/)으로 이동한다", () => {
    handleFinalModalClose(mockRouter, mockQueryClient);

    expect(localStore[ONBOARDING_KEY]).toBe("true");
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["onboarding-status"],
    });
  });

  it("초대 groupId로 이동한 후 pendingInvite는 스토리지에서 제거된다", () => {
    sessionStore[PENDING_INVITE_KEY] = "to-remove-group";
    localStore[PENDING_INVITE_KEY] = "to-remove-group";

    handleFinalModalClose(mockRouter, mockQueryClient);

    expect(sessionStore[PENDING_INVITE_KEY]).toBeUndefined();
    expect(localStore[PENDING_INVITE_KEY]).toBeUndefined();
  });
});
