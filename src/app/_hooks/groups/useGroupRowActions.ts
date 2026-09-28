"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { MyGroup } from "@/app/_types/groups";
import { useGroupMemberStatus } from "@/app/_hooks/_websocket/status/useGroupMemberStatus";
import { getUserIdFromToken } from "@/app/_lib/getJwtExp";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
import { useEnterOfficialLounge } from "@/app/_hooks/lounge/useEnterOfficialLounge";
import { useLeaveGroup } from "@/app/_hooks/groups/useLeaveGroup";
import { loungeKeys } from "@/app/api/lounge/keys";
import { groupKeys } from "@/app/api/groups/keys";

const OFFICIAL_LOUNGE_PROFILE_GROUP_ID = "ac120006-9d7c-1377-819d-7c8397700000";

const isValidImageUrl = (url?: string) =>
  Boolean(
    url &&
      (url.startsWith("/") ||
        url.startsWith("http://") ||
        url.startsWith("https://"))
  );

/** 홈 그룹/라운지 row의 입장·나가기·멤버 상태 로직 */
export function useGroupRowActions(group: MyGroup) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isOfficial = group.isOfficialLounge === true;
  const { groupId, imageUrl, members } = group;
  const { mutate: leaveGroupMutate } = useLeaveGroup();
  const enterOfficialMutation = useEnterOfficialLounge();

  const [blockedOpen, setBlockedOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [hostLeaveBlocked, setHostLeaveBlocked] = useState(false);

  const { token } = useAuthState();
  const currentUserId = getUserIdFromToken(token);

  const isHost =
    !isOfficial &&
    Boolean(
      currentUserId &&
        members.some((m) => m.userId === currentUserId && m.role === "HOST")
    );

  const { membersWithStatus, activeCount } = useGroupMemberStatus({
    groupId,
    members,
    enabled: true,
  });

  const sortedMembersWithStatus = [...membersWithStatus].sort(
    (a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0)
  );

  const handleEnter = async () => {
    if (isOfficial) {
      try {
        const next = await enterOfficialMutation.mutateAsync();
        queryClient.setQueryData(loungeKeys.summary(), next);
        queryClient.invalidateQueries({ queryKey: groupKeys.my() });
        router.push("/lounge?entered=1");
      } catch (error) {
        const err = error as Error & { status?: number };
        const isFull =
          err.status === 409 ||
          err.message.includes("열기로 가득") ||
          err.message.includes("공식 라운지");
        if (isFull) {
          setBlockedOpen(true);
          return;
        }
        console.error("공식 라운지 입장 실패:", error);
      }
      return;
    }

    setIsEntering(true);
    sessionStorage.setItem(`group_enter_time_${groupId}`, Date.now().toString());
    router.push(`/group/${groupId}`);
  };

  const closeLeaveModal = () => {
    setLeaveModalOpen(false);
    setHostLeaveBlocked(false);
  };

  const confirmLeave = () => {
    if (isHost || hostLeaveBlocked) {
      closeLeaveModal();
      return;
    }

    leaveGroupMutate(groupId, {
      onSuccess: () => {
        setLeaveModalOpen(false);
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : String(error);
        const status = (error as Error & { status?: number }).status;
        const isHostBlocked =
          status === 400 ||
          message.includes("방장") ||
          message.includes("탈퇴가 거부") ||
          message.toLowerCase().includes("host");
        if (isHostBlocked) {
          setHostLeaveBlocked(true);
          return;
        }
        console.error("그룹 나가기 실패:", error);
        alert(message || "그룹 나가기에 실패했습니다.");
        setLeaveModalOpen(false);
      },
    });
  };

  const groupImageSrc: string | null =
    groupId === OFFICIAL_LOUNGE_PROFILE_GROUP_ID
      ? "/loungeProfile.svg"
      : isValidImageUrl(imageUrl)
        ? imageUrl!
        : null;

  return {
    isOfficial,
    isHost,
    sortedMembersWithStatus,
    activeCount,
    totalCount: members.length,
    groupImageSrc,
    handleEnter,
    isEnterBusy: isOfficial ? enterOfficialMutation.isPending : isEntering,
    blockedOpen,
    closeBlocked: () => setBlockedOpen(false),
    leaveModalOpen,
    openLeaveModal: () => setLeaveModalOpen(true),
    closeLeaveModal,
    confirmLeave,
    hostLeaveBlocked,
  };
}
