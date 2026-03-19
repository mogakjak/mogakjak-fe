import { setPendingInviteGroupId, getPendingInviteGroupId, removePendingInviteGroupId } from "../pendingInvite";

/**
 * URL에 invite 파라미터가 있으면 스토리지에 저장하고 클린업 여부를 반환합니다.
 * (LoginPageClient에서 사용)
 */
export function processInviteParam(searchParams: URLSearchParams): string | null {
  const inviteGroupId = searchParams.get("invite");
  if (inviteGroupId) {
    setPendingInviteGroupId(inviteGroupId);
    return inviteGroupId;
  }
  return null;
}

/**
 * 온보딩 완료 시 어디로 리다이렉트할지 결정하고 온보딩 완료 상태를 저장합니다.
 * (OnboardingPage에서 사용)
 */
export function getOnboardingRedirectPath(): string {
  if (typeof window !== "undefined") {
    localStorage.setItem("mg_onboarded_v1", "true");
  }

  const inviteGroupId = getPendingInviteGroupId();
  if (inviteGroupId) {
    removePendingInviteGroupId();
    return `/invite/${inviteGroupId}`;
  }
  return "/";
}

/**
 * 그룹 가입 오류가 권한 부족(401)인지 확인합니다.
 * (InvitePageClient에서 사용)
 */
export function isJoinGroupUnauthorized(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();
  
  return (
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("401") ||
    errorMessage.includes("인증") ||
    errorMessage.includes("로그인")
  );
}

/**
 * 그룹 가입 오류가 이미 멤버임(409)을 의미하는지 확인합니다.
 * (InvitePageClient에서 사용)
 */
export function isJoinGroupAlreadyMember(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();
  const errWithStatus = error as { status?: number } | null;
  const errStatus = errWithStatus?.status;

  return (
    errStatus === 409 ||
    errorMessage.includes("이미 참여") ||
    errorMessage.includes("409") ||
    lowerMessage.includes("conflict") ||
    lowerMessage.includes("already member") ||
    lowerMessage.includes("already participating") ||
    lowerMessage.includes("already in")
  );
}

/**
 * 그룹 가입 오류가 그룹을 찾을 수 없음(404)을 의미하는지 확인합니다.
 */
export function isJoinGroupNotFound(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();
  const errWithStatus = error as { status?: number } | null;
  const errStatus = errWithStatus?.status;

  return (
    errStatus === 404 ||
    errorMessage.includes("그룹을 찾을 수 없습니다") ||
    errorMessage.includes("그룹을 찾을 수 없음") ||
    errorMessage.includes("Group not found") ||
    errorMessage.includes("group not found") ||
    lowerMessage.includes("not found") ||
    lowerMessage.includes("404")
  );
}

/**
 * 초대 페이지에서 가입 로직을 처리할 때의 액션을 정의합니다.
 */
export type InviteJoinAction =
  | { type: "REDIRECT"; path: string; savePending?: boolean }
  | { type: "TOAST"; message: string }
  | { type: "SUCCESS"; path: string };

/**
 * 로그인 여부와 에러 상태에 따라 어떤 조치를 취할지 결정하는 순수 함수입니다.
 */
export function decideInviteJoinAction({
  groupId,
  isLoggedIn,
  error = null,
}: {
  groupId: string;
  isLoggedIn: boolean;
  error?: unknown;
}): InviteJoinAction {
  if (!isLoggedIn) {
    return { type: "REDIRECT", path: "/login", savePending: true };
  }

  if (error) {
    if (isJoinGroupUnauthorized(error)) {
      return { type: "REDIRECT", path: "/login", savePending: true };
    }

    if (isJoinGroupAlreadyMember(error)) {
      return { type: "SUCCESS", path: `/group/${groupId}` };
    }

    if (isJoinGroupNotFound(error)) {
      return { type: "TOAST", message: "만료된 그룹 링크입니다" };
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return { type: "TOAST", message: errorMessage };
  }

  return { type: "SUCCESS", path: `/group/${groupId}` };
}
