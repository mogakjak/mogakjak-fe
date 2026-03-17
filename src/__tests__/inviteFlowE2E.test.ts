export {};

/**
 * 비회원 초대링크 플로우 통합 테스트
 *
 * 검증 플로우:
 * [1단계] 비회원이 /invite/[id] 접근
 *         → 미들웨어가 /login?invite=[id] 리다이렉트 대상을 결정
 * [2단계] /login?invite=[id] 에 도달
 *         → LoginPageClient가 invite 파라미터를 읽어 sessionStorage/localStorage에 저장
 * [3단계] 회원가입 후 온보딩 완료
 *         → handleFinalModalClose가 저장된 inviteId를 읽어 /invite/[id]로 이동
 */

const PENDING_INVITE_KEY = "mg_invite_groupid";
const ONBOARDING_KEY = "mg_onboarded_v1";

// ─────────────────────────────────────────
// 테스트용 Storage 모킹 헬퍼
// ─────────────────────────────────────────
function createStore() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    _store: () => store,
  };
}

// ─────────────────────────────────────────
// 핵심 로직 함수들 (실제 소스에서 추출)
// ─────────────────────────────────────────

/** middleware.ts: 비회원 /invite 접근 처리 */
function middlewareInviteRedirect(pathname: string, isLoggedIn: boolean, isBot: boolean) {
  if (!pathname.startsWith("/invite")) return null;
  if (isBot || isLoggedIn) return null; // 통과

  const cleanPathname = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const groupId = cleanPathname.substring(cleanPathname.lastIndexOf("/") + 1);

  if (!groupId || groupId === "invite") return null;

  return { redirectTo: "/login", inviteParam: groupId }; // /login?invite=[id]
}

/** LoginPageClient.tsx: /login?invite=[id] 파라미터 읽어 스토리지에 저장 */
function loginPageSaveInvite(
  searchString: string,
  session: { setItem: (k: string, v: string) => void },
  local: { setItem: (k: string, v: string) => void }
) {
  const params = new URLSearchParams(searchString);
  const inviteGroupId = params.get("invite");
  if (inviteGroupId) {
    session.setItem(PENDING_INVITE_KEY, inviteGroupId);
    local.setItem(PENDING_INVITE_KEY, inviteGroupId);
  }
  return inviteGroupId;
}

/** onboarding/page.tsx: handleFinalModalClose - 온보딩 완료 시 초대 처리 */
function onboardingFinalClose(
  session: { getItem: (k: string) => string | null; removeItem: (k: string) => void },
  local: {
    getItem: (k: string) => string | null;
    setItem: (k: string, v: string) => void;
    removeItem: (k: string) => void;
  },
  router: { replace: (path: string) => void },
  queryClient: { invalidateQueries: (opts: object) => void }
) {
  local.setItem(ONBOARDING_KEY, "true");

  const inviteGroupId =
    session.getItem(PENDING_INVITE_KEY) || local.getItem(PENDING_INVITE_KEY);

  if (inviteGroupId) {
    session.removeItem(PENDING_INVITE_KEY);
    local.removeItem(PENDING_INVITE_KEY);
    queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
    router.replace(`/invite/${inviteGroupId}`);
    return;
  }

  queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
  router.replace("/");
}

/** InvitePageClient.tsx: 비로그인 시 pendingInvite 저장 후 /login으로 이동 */
async function invitePageLogic(
  groupId: string,
  isLoggedIn: boolean,
  joinGroupFn: (id: string) => Promise<void>,
  router: { replace: (path: string) => void },
  session: { setItem: (k: string, v: string) => void; removeItem?: (k: string) => void },
  local: { setItem: (k: string, v: string) => void; removeItem?: (k: string) => void },
  locationReplace: (path: string) => void
) {
  if (!isLoggedIn) {
    session.setItem(PENDING_INVITE_KEY, groupId);
    local.setItem(PENDING_INVITE_KEY, groupId);
    router.replace("/login");
    return;
  }

  try {
    await joinGroupFn(groupId);
    session.removeItem?.(PENDING_INVITE_KEY);
    local.removeItem?.(PENDING_INVITE_KEY);
    locationReplace(`/group/${groupId}`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const lowerMessage = errorMessage.toLowerCase();
    const errWithStatus = err as { status?: number } | null;

    if (lowerMessage.includes("unauthorized") || lowerMessage.includes("401")) {
      session.setItem(PENDING_INVITE_KEY, groupId);
      local.setItem(PENDING_INVITE_KEY, groupId);
      router.replace("/login");
      return;
    }

    const isAlreadyMember =
      errWithStatus?.status === 409 || lowerMessage.includes("already member") || errorMessage.includes("이미 참여");

    if (isAlreadyMember) {
      locationReplace(`/group/${groupId}`);
    }
  }
}

// ─────────────────────────────────────────
// 테스트
// ─────────────────────────────────────────

describe("비회원 초대링크 전체 플로우", () => {
  let session: ReturnType<typeof createStore>;
  let local: ReturnType<typeof createStore>;
  let mockRouter: { replace: jest.Mock };
  let mockQueryClient: { invalidateQueries: jest.Mock };
  let mockLocationReplace: jest.Mock;

  beforeEach(() => {
    session = createStore();
    local = createStore();
    mockRouter = { replace: jest.fn() };
    mockQueryClient = { invalidateQueries: jest.fn() };
    mockLocationReplace = jest.fn();
  });

  // ────────────── 1단계: 미들웨어 ──────────────
  describe("[1단계] 미들웨어 - /invite/[id] 접근 시 /login?invite=[id] 리다이렉트 결정", () => {
    it("비회원이 /invite/[groupId] 접근 시 /login?invite=[groupId]으로 이동해야 한다", () => {
      const result = middlewareInviteRedirect("/invite/abc-123", false, false);
      expect(result).not.toBeNull();
      expect(result?.redirectTo).toBe("/login");
      expect(result?.inviteParam).toBe("abc-123");
    });

    it("trailing slash가 있어도 groupId를 올바르게 추출한다", () => {
      const result = middlewareInviteRedirect("/invite/abc-123/", false, false);
      expect(result?.inviteParam).toBe("abc-123");
    });

    it("카카오/검색 봇은 리다이렉트하지 않고 통과시킨다", () => {
      const result = middlewareInviteRedirect("/invite/abc-123", false, true);
      expect(result).toBeNull();
    });

    it("로그인 사용자는 리다이렉트하지 않고 초대 페이지로 통과시킨다", () => {
      const result = middlewareInviteRedirect("/invite/abc-123", true, false);
      expect(result).toBeNull();
    });

    it("/invite 경로가 아니면 null을 반환한다", () => {
      expect(middlewareInviteRedirect("/", false, false)).toBeNull();
      expect(middlewareInviteRedirect("/login", false, false)).toBeNull();
      expect(middlewareInviteRedirect("/group/123", false, false)).toBeNull();
    });
  });

  // ────────────── 2단계: 로그인 페이지 ──────────────
  describe("[2단계] LoginPageClient - ?invite=[id] 파라미터를 스토리지에 저장", () => {
    it("[핵심] /login?invite=[id] 접근 시 inviteGroupId를 sessionStorage에 저장한다", () => {
      loginPageSaveInvite("invite=group-xyz", session, local);
      expect(session._store()[PENDING_INVITE_KEY]).toBe("group-xyz");
    });

    it("[핵심] /login?invite=[id] 접근 시 inviteGroupId를 localStorage에도 저장한다", () => {
      loginPageSaveInvite("invite=group-xyz", session, local);
      expect(local._store()[PENDING_INVITE_KEY]).toBe("group-xyz");
    });

    it("invite 파라미터가 없으면 스토리지에 아무것도 저장하지 않는다", () => {
      loginPageSaveInvite("", session, local);
      expect(session._store()[PENDING_INVITE_KEY]).toBeUndefined();
      expect(local._store()[PENDING_INVITE_KEY]).toBeUndefined();
    });

    it("저장된 inviteGroupId 값이 URL의 groupId와 일치한다", () => {
      const groupId = "specific-group-id-456";
      loginPageSaveInvite(`invite=${groupId}`, session, local);
      expect(session._store()[PENDING_INVITE_KEY]).toBe(groupId);
      expect(local._store()[PENDING_INVITE_KEY]).toBe(groupId);
    });
  });

  // ────────────── 3단계: 온보딩 완료 ──────────────
  describe("[3단계] 온보딩 완료 - 저장된 inviteId로 /invite/[id] 이동", () => {
    it("[핵심] 온보딩 완료 + 초대 ID 있음 → /invite/[id]로 이동한다", () => {
      session.setItem(PENDING_INVITE_KEY, "group-xyz");

      onboardingFinalClose(session, local, mockRouter, mockQueryClient);

      expect(mockRouter.replace).toHaveBeenCalledWith("/invite/group-xyz");
      expect(mockRouter.replace).not.toHaveBeenCalledWith("/");
    });

    it("[핵심] 온보딩 완료 후 localStorage에만 inviteId가 있으면 /invite/[id]로 이동한다", () => {
      local.setItem(PENDING_INVITE_KEY, "local-only-group");

      onboardingFinalClose(session, local, mockRouter, mockQueryClient);

      expect(mockRouter.replace).toHaveBeenCalledWith("/invite/local-only-group");
    });

    it("온보딩 완료 + 초대 ID 없음 → 홈(/)으로 이동한다", () => {
      onboardingFinalClose(session, local, mockRouter, mockQueryClient);

      expect(mockRouter.replace).toHaveBeenCalledWith("/");
    });

    it("온보딩 완료 시 localStorage에 mg_onboarded_v1='true'가 저장된다", () => {
      onboardingFinalClose(session, local, mockRouter, mockQueryClient);
      expect(local._store()[ONBOARDING_KEY]).toBe("true");
    });

    it("초대 ID로 이동 후 스토리지에서 pendingInvite가 제거된다", () => {
      session.setItem(PENDING_INVITE_KEY, "to-remove");
      local.setItem(PENDING_INVITE_KEY, "to-remove");

      onboardingFinalClose(session, local, mockRouter, mockQueryClient);

      expect(session._store()[PENDING_INVITE_KEY]).toBeUndefined();
      expect(local._store()[PENDING_INVITE_KEY]).toBeUndefined();
    });

    it("onboarding-status 쿼리가 무효화된다", () => {
      onboardingFinalClose(session, local, mockRouter, mockQueryClient);
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["onboarding-status"],
      });
    });
  });

  // ────────────── 4단계: InvitePageClient ──────────────
  describe("[추가] InvitePageClient - /invite/[id] 페이지 직접 접근 시 처리", () => {
    it("[핵심] 비로그인 상태에서 /invite/[id] 직접 접근 시 스토리지에 groupId를 저장한다", async () => {
      await invitePageLogic("direct-group-id", false, jest.fn(), mockRouter, session, local, mockLocationReplace);

      expect(session._store()[PENDING_INVITE_KEY]).toBe("direct-group-id");
      expect(local._store()[PENDING_INVITE_KEY]).toBe("direct-group-id");
    });

    it("[핵심] 비로그인 상태에서 /invite/[id] 직접 접근 시 /login으로 이동한다", async () => {
      await invitePageLogic("direct-group-id", false, jest.fn(), mockRouter, session, local, mockLocationReplace);

      expect(mockRouter.replace).toHaveBeenCalledWith("/login");
    });

    it("로그인 상태에서 joinGroup 성공 → /group/[id]로 이동한다", async () => {
      const joinFn = jest.fn().mockResolvedValue(undefined);
      await invitePageLogic("group-abc", true, joinFn, mockRouter, session, local, mockLocationReplace);

      expect(joinFn).toHaveBeenCalledWith("group-abc");
      expect(mockLocationReplace).toHaveBeenCalledWith("/group/group-abc");
    });

    it("이미 멤버(409)인 경우 /group/[id]로 바로 이동한다", async () => {
      const err = Object.assign(new Error("이미 참여"), { status: 409 });
      const joinFn = jest.fn().mockRejectedValue(err);
      await invitePageLogic("group-abc", true, joinFn, mockRouter, session, local, mockLocationReplace);

      expect(mockLocationReplace).toHaveBeenCalledWith("/group/group-abc");
    });
  });

  // ────────────── 전체 E2E 시뮬레이션 ──────────────
  describe("[E2E] 전체 플로우: 비회원 → 로그인 → 온보딩 → 초대방 이동", () => {
    it("비회원이 /invite/group-777 접근부터 온보딩 완료까지 전체 플로우가 올바르게 동작한다", async () => {
      const GROUP_ID = "group-777";

      // [1] 미들웨어: 비회원이 /invite/group-777 접근 → /login?invite=group-777 결정
      const middlewareResult = middlewareInviteRedirect(`/invite/${GROUP_ID}`, false, false);
      expect(middlewareResult?.redirectTo).toBe("/login");
      expect(middlewareResult?.inviteParam).toBe(GROUP_ID);

      // [2] LoginPageClient: /login?invite=group-777 도달 시 스토리지에 저장
      loginPageSaveInvite(`invite=${middlewareResult!.inviteParam}`, session, local);
      expect(session._store()[PENDING_INVITE_KEY]).toBe(GROUP_ID);
      expect(local._store()[PENDING_INVITE_KEY]).toBe(GROUP_ID);

      // [3] 회원가입 & 온보딩 완료 → /invite/group-777 로 이동
      onboardingFinalClose(session, local, mockRouter, mockQueryClient);

      expect(local._store()[ONBOARDING_KEY]).toBe("true");
      expect(mockRouter.replace).toHaveBeenCalledWith(`/invite/${GROUP_ID}`);
      // pendingInvite 제거 확인
      expect(session._store()[PENDING_INVITE_KEY]).toBeUndefined();
      expect(local._store()[PENDING_INVITE_KEY]).toBeUndefined();
    });
  });
});
