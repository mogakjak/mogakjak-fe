import { useMemo } from "react";
import { getUserIdFromToken } from "@/app/_lib/getJwtExp";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
import type { GroupMemberStatus } from "@/app/_hooks/_websocket/status/useGroupMemberStatus";

/**
 * 현재 사용자가 그룹의 방장인지 판단하는 커스텀 훅
 * @param memberStatuses 그룹 멤버 상태 맵
 * @returns 현재 사용자가 방장이면 true, 아니면 false
 */
export function useIsGroupHost(
    memberStatuses?: Map<string, GroupMemberStatus>,
) {
    const { token } = useAuthState();

    const isHost = useMemo(() => {
        if (!token || !memberStatuses) return false;

        const currentUserId = getUserIdFromToken(token);
        if (!currentUserId) return false;

        const currentUserStatus = memberStatuses.get(currentUserId);
        return currentUserStatus?.role === "HOST";
    }, [token, memberStatuses]);

    return isHost;
}
