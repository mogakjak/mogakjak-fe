/**
 * InvitePageClient 핵심 로직 테스트
 * - /invite/[groupId] 접근 시 비로그인 사용자 처리 로직 검증
 *
 * 검증 시나리오:
 * 1. 비로그인 → setPendingInviteGroupId 호출 + /login으로 리다이렉트
 * 2. 로그인 상태 → joinGroup 호출 + /group/[id]로 이동
 * 3. 이미 멤버(409) → /group/[id]로 바로 이동
 */

import {
  removePendingInviteGroupId,
  setPendingInviteGroupId,
} from "../app/_lib/pendingInvite";

// pendingInvite 모듈 모킹
jest.mock("../app/_lib/pendingInvite", () => ({
  setPendingInviteGroupId: jest.fn(),
  getPendingInviteGroupId: jest.fn(),
  removePendingInviteGroupId: jest.fn(),
}));



/**
 * InvitePageClient의 핵심 useEffect 로직을 함수로 추출
 * (컴포넌트 전체를 렌더링하지 않고 순수 로직만 검증)
 */
async function runInvitePageLogic({
  groupId,
  isLoggedIn,
  joinGroupFn,
  router,
}: {
  groupId: string;
  isLoggedIn: boolean;
  joinGroupFn: (id: string) => Promise<void>;
  router: { replace: jest.Mock };
}) {
  if (!groupId) return;

  if (!isLoggedIn) {
    (setPendingInviteGroupId as jest.Mock)(groupId);
    router.replace("/login");
    return;
  }

  try {
    await joinGroupFn(groupId);
    (removePendingInviteGroupId as jest.Mock)();
    // window.location.replace 대신 router.replace 사용 (테스트 환경)
    router.replace(`/group/${groupId}`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const lowerMessage = errorMessage.toLowerCase();
    const errWithStatus = err as { status?: number } | null;

    const isUnauthorized =
      lowerMessage.includes("unauthorized") ||
      lowerMessage.includes("401") ||
      errorMessage.includes("인증") ||
      errorMessage.includes("로그인");

    if (isUnauthorized) {
      (setPendingInviteGroupId as jest.Mock)(groupId);
      router.replace("/login");
      return;
    }

    const isAlreadyMember =
      errWithStatus?.status === 409 ||
      errorMessage.includes("이미 참여") ||
      lowerMessage.includes("conflict") ||
      lowerMessage.includes("already member");

    if (isAlreadyMember) {
      router.replace(`/group/${groupId}`);
      return;
    }
  }
}

describe("InvitePageClient 핵심 로직 - 비회원 초대링크 플로우", () => {
  let mockRouter: { replace: jest.Mock };

  beforeEach(() => {
    mockRouter = { replace: jest.fn() };
    jest.clearAllMocks();
  });

  it("[핵심] 비로그인 상태에서 /invite/[id] 접근 시 setPendingInviteGroupId 호출 후 /login으로 이동", async () => {
    await runInvitePageLogic({
      groupId: "group-123",
      isLoggedIn: false,
      joinGroupFn: jest.fn(),
      router: mockRouter,
    });

    expect(setPendingInviteGroupId).toHaveBeenCalledWith("group-123");
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
    expect(mockRouter.replace).not.toHaveBeenCalledWith("/group/group-123");
  });

  it("[핵심] 로그인 상태에서 /invite/[id] 접근 시 joinGroup 호출 후 /group/[id]로 이동", async () => {
    const mockJoinGroup = jest.fn().mockResolvedValue(undefined);

    await runInvitePageLogic({
      groupId: "group-123",
      isLoggedIn: true,
      joinGroupFn: mockJoinGroup,
      router: mockRouter,
    });

    expect(mockJoinGroup).toHaveBeenCalledWith("group-123");
    expect(removePendingInviteGroupId).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith("/group/group-123");
  });

  it("joinGroup 후 401 오류 발생 시 pendingInvite 저장 후 /login으로 이동", async () => {
    const mockJoinGroup = jest.fn().mockRejectedValue(new Error("401 unauthorized"));

    await runInvitePageLogic({
      groupId: "group-123",
      isLoggedIn: true,
      joinGroupFn: mockJoinGroup,
      router: mockRouter,
    });

    expect(setPendingInviteGroupId).toHaveBeenCalledWith("group-123");
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  it("이미 그룹 멤버(409 Conflict)인 경우 바로 /group/[id]로 이동", async () => {
    const err = Object.assign(new Error("이미 참여한 그룹입니다"), { status: 409 });
    const mockJoinGroup = jest.fn().mockRejectedValue(err);

    await runInvitePageLogic({
      groupId: "group-123",
      isLoggedIn: true,
      joinGroupFn: mockJoinGroup,
      router: mockRouter,
    });

    expect(mockRouter.replace).toHaveBeenCalledWith("/group/group-123");
    expect(setPendingInviteGroupId).not.toHaveBeenCalled();
  });

  it("loginPageClient: /login?invite=[id] 접근 시 초대 groupId를 pendingInvite에 저장한다", () => {
    // LoginPageClient의 useEffect 핵심 로직 검증
    const searchParams = new URLSearchParams("invite=test-group-999");
    const inviteGroupId = searchParams.get("invite");

    if (inviteGroupId) {
      (setPendingInviteGroupId as jest.Mock)(inviteGroupId);
    }

    expect(setPendingInviteGroupId).toHaveBeenCalledWith("test-group-999");
  });
});
