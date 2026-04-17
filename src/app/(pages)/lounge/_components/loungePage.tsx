"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/button";
import AlertModal from "@/app/_components/common/timer/alertModal";
import TimerEndModal from "@/app/_components/common/timerEndModal";
import Icon from "@/app/_components/common/Icons";
import ReviewPopup from "@/app/_components/group/review/reviewPopup";
import ToggleButton from "@/app/_components/group/modal/toggleButton";
import InviteModal from "@/app/_components/home/room/inviteModal";
import PreviewMain from "@/app/_components/home/previewMain";
import SidebarButton from "@/app/(pages)/group/_components/sidebar/sidebarButton";
import { useTimer } from "@/app/_contexts/TimerContext";
import Add from "/Icons/add.svg";
import { useOfficialLoungeSummary } from "@/app/_hooks/lounge/useOfficialLoungeSummary";
import { useOfficialLoungePresenceSubscription } from "@/app/_hooks/lounge/useOfficialLoungePresenceSubscription";
import { useEnterOfficialLounge } from "@/app/_hooks/lounge/useEnterOfficialLounge";
import { useLeaveOfficialLounge } from "@/app/_hooks/lounge/useLeaveOfficialLounge";
import { useSendOfficialLoungeCheer } from "@/app/_hooks/lounge/useSendOfficialLoungeCheer";
import { useUpdateOfficialLoungeFocusCheck } from "@/app/_hooks/lounge/useUpdateOfficialLoungeFocusCheck";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
import { getUserIdFromToken } from "@/app/_lib/getJwtExp";
import { loungeKeys } from "@/app/api/lounge/keys";
import { groupKeys } from "@/app/api/groups/keys";
import GroupFriendField from "@/app/(pages)/group/_components/field/groupFriendField";
import type { HomeGroupMember } from "@/app/_types/groups";

function toDisplayStatus(member: HomeGroupMember) {
  if (member.participationStatus === "PARTICIPATING") return "active" as const;
  if (member.participationStatus === "RESTING") return "rest" as const;
  return "end" as const;
}

export default function LoungePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const enterMutation = useEnterOfficialLounge();
  const leaveMutation = useLeaveOfficialLounge();
  const cheerMutation = useSendOfficialLoungeCheer();
  const focusMutation = useUpdateOfficialLoungeFocusCheck();
  const { token } = useAuthState();
  const enteredFromHome = searchParams.get("entered") === "1";
  const [entered, setEntered] = useState(enteredFromHome);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const isEnteringRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const currentUserId = useMemo(() => getUserIdFromToken(token), [token]);

  useOfficialLoungePresenceSubscription({
    enabled: entered,
  });

  const { data: lounge, isLoading: loungeLoading } = useOfficialLoungeSummary({
    enabled: entered,
  });

  const { isRunning, forceStopTimer } = useTimer();
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [openTimerEndModal, setOpenTimerEndModal] = useState(false);
  const [openReview, setOpenReview] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const isExitingRef = useRef(false);

  useEffect(() => {
    if (enteredFromHome) {
      setEntered(true);
    }
  }, [enteredFromHome]);

  const attemptEnter = useCallback(async () => {
    if (isEnteringRef.current) return;
    isEnteringRef.current = true;
    try {
      const next = await enterMutation.mutateAsync();
      hasEnteredRef.current = true;
      setEntered(true);
      queryClient.setQueryData(loungeKeys.summary(), next);
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
      if (!enteredFromHome) {
        router.replace("/lounge?entered=1");
      }
    } catch (error) {
      const err = error as Error & { status?: number };
      const errorMessage = err.message ?? "";
      const lowerMessage = errorMessage.toLowerCase();
      const isFull =
        err.status === 409 ||
        err.status === 423 ||
        err.status === 429 ||
        errorMessage.includes("열기로 가득") ||
        errorMessage.includes("정원") ||
        errorMessage.includes("인원이 가득") ||
        errorMessage.includes("접속할 수 없") ||
        lowerMessage.includes("full") ||
        lowerMessage.includes("capacity") ||
        lowerMessage.includes("max member");

      if (isFull) {
        hasEnteredRef.current = false;
        setEntered(false);
        setBlockedOpen(true);
        return;
      }

      console.error("공식 라운지 입실 실패:", error);
      router.replace("/");
    } finally {
      isEnteringRef.current = false;
    }
  }, [enterMutation, queryClient, router, enteredFromHome]);

  useEffect(() => {
    if (!entered) {
      void attemptEnter();
      return;
    }

    if (lounge && !lounge.hasEntered) {
      void attemptEnter();
      return;
    }

    if (lounge?.hasEntered) {
      hasEnteredRef.current = true;
    }
  }, [attemptEnter, entered, lounge]);

  useEffect(() => {
    const leaveIfNeeded = () => {
      if (!hasEnteredRef.current) return;
      void leaveMutation
        .mutateAsync()
        .catch((error) => console.error("공식 라운지 퇴실 실패:", error));
      hasEnteredRef.current = false;
    };

    window.addEventListener("pagehide", leaveIfNeeded);
    return () => {
      window.removeEventListener("pagehide", leaveIfNeeded);
    };
  }, [leaveMutation]);

  const displayedMembers = useMemo(() => {
    const members = lounge?.members ?? [];
    if (!currentUserId) return members;
    return [...members].sort((a, b) => {
      if (a.userId === currentUserId) return -1;
      if (b.userId === currentUserId) return 1;
      return 0;
    });
  }, [currentUserId, lounge?.members]);

  const participatingMemberCount = useMemo(() => {
    if (!lounge?.members?.length) return 0;
    return lounge.members.filter(
      (m) => m.participationStatus !== "NOT_PARTICIPATING",
    ).length;
  }, [lounge?.members]);

  const memberListTotal = lounge?.members?.length ?? 0;
  const currentMemberCount = lounge?.currentMemberCount ?? displayedMembers.length;
  const hasQuote = Boolean(lounge?.todayQuote?.content);
  const focusEnabled = lounge?.myFocusCheckEnabled ?? false;

  const handleCheer = async (targetUserId: string) => {
    try {
      await cheerMutation.mutateAsync(targetUserId);
    } catch (error) {
      console.error("공식 라운지 응원 실패:", error);
    }
  };

  const handleFinalExit = useCallback(async () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    setIsExiting(true);
    try {
      await leaveMutation.mutateAsync();
      hasEnteredRef.current = false;
      setEntered(false);
      router.push("/");
    } catch (error) {
      console.error("공식 라운지 퇴실 실패:", error);
    } finally {
      isExitingRef.current = false;
      setIsExiting(false);
    }
  }, [leaveMutation, router]);

  const handleBlockedClose = () => {
    setBlockedOpen(false);
    router.replace("/");
  };

  const handleFocusToggle = async (nextEnabled: boolean) => {
    try {
      await focusMutation.mutateAsync(nextEnabled);
    } catch (error) {
      console.error("집중 체크 설정 변경 실패:", error);
    }
  };

  const loungeTitle = lounge?.groupName ?? "공식 라운지";
  const showMemberSkeleton = loungeLoading || !lounge;

  return (
    <main className="w-full h-full max-w-[1440px] mx-auto flex flex-col gap-1 overflow-x-hidden pt-5">
      <div className="flex gap-1 px-6 mb-2">
        <p className="text-heading4-20SB">{loungeTitle}</p>
      </div>

      <div className="w-full h-full flex gap-5">
        <div className="self-stretch shrink-0">
          <PreviewMain state={true} groupId={lounge?.groupId ?? ""} />
        </div>

        <div className="flex flex-col items-center w-full gap-5 min-w-0 flex-1">
          <div className="flex gap-5 w-full">
            <div className="flex flex-3 min-w-0 flex-col gap-3 bg-white px-8 py-5 rounded-2xl">
              <h3 className="text-heading4-20SB text-black">오늘의 한마디</h3>
              <div className="flex h-[108px] flex-1 flex-col justify-center rounded-2xl border border-gray-200 bg-gray-100 px-10 py-8 text-gray-700 overflow-y-auto">
  {hasQuote ? (
    <div className="text-center">
      <p className="text-body1-16R leading-7">
        {lounge?.todayQuote?.content}
      </p>
    </div>
  ) : (
    <p className="text-center text-body1-16R leading-7 text-gray-500">
      명언을 불러오는 중이에요.
    </p>
  )}
</div>
            </div>

            <div className="flex flex-3 min-w-0 flex-col gap-3 bg-white px-8 py-5 rounded-2xl">
              <h3 className="text-heading4-20SB text-black">라운지 현황</h3>
              <div className="flex h-[108px] flex-1 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 px-6 py-6 text-gray-700">
                <p className="text-heading2-28SB text-center">
                  {currentMemberCount}명 🔥
                </p>
                <p className="mt-2 text-body1-16R text-center text-gray-600">
                  함께 몰입 중입니다
                </p>
              </div>
            </div>

            <div className="flex flex-2 min-w-0 flex-col gap-3 bg-white px-8 py-5 rounded-2xl">
              <h3 className="text-heading4-20SB text-black text-center">
                집중 체크 알림
              </h3>
              <div className="flex flex-col gap-4 mt-3">
                  <p className="text-heading2-28SB text-black text-center">
                    매 시 정각
                  </p>
                <div className="flex w-full justify-center">
                  <ToggleButton
                    checked={focusEnabled}
                    onChange={(e) => void handleFocusToggle(e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full bg-white rounded-2xl px-8 pt-8 pb-6 h-[590px] flex flex-col flex-1">
            <div className="flex justify-between mb-2">
              <p className="text-heading4-20R text-gray-600 mb-3">
                <b className="text-black">그룹원</b> {participatingMemberCount}/
                {memberListTotal}
              </p>
              <SidebarButton
                className="px-7 py-2 cursor-pointer"
                onClick={() => setOpenInviteModal(true)}
              >
                <Icon Svg={Add} size={24} className="text-gray-800" />
                그룹원 추가하기
              </SidebarButton>
            </div>
            <div className="flex flex-col items-center justify-center w-full flex-1 min-h-0">
              {showMemberSkeleton ? (
                <div className="w-full flex-1 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-x-5 gap-y-3">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <GroupFriendField
                        key={`skeleton-${index}`}
                        status="end"
                        level={1}
                        isLoading={true}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full flex-1 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-x-5 gap-y-3">
                    {displayedMembers.map((member) => (
                      <GroupFriendField
                        key={member.userId}
                        status={toDisplayStatus(member)}
                        friendName={member.nickname}
                        level={member.level}
                        isPublic={true}
                        activeTime={member.personalTimerSeconds ?? undefined}
                        task={member.todoTitle ?? undefined}
                        lastActiveAt={member.lastActiveAt ?? undefined}
                        profileUrl={member.profileUrl}
                        isCurrentUser={member.userId === currentUserId}
                        isHost={false}
                        cheerCount={member.cheerCount ?? 0}
                        userId={member.userId}
                        groupId={lounge?.groupId}
                        onCheerClick={handleCheer}
                        showCheerAction={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex mt-4">
              <Button
                onClick={() => {
                  if (isRunning) {
                    setOpenTimerEndModal(true);
                  } else {
                    setOpenReview(true);
                  }
                }}
                leftIconSrc="/Icons/timerOut.svg"
                size="custom"
                className="text-body1-16SB h-11 px-5 text-base rounded-2xl ml-auto"
              >
                몰입 종료 후 나가기
              </Button>
            </div>
          </div>
        </div>
      </div>

      {openTimerEndModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenTimerEndModal(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <TimerEndModal
              onClose={() => setOpenTimerEndModal(false)}
              onConfirm={async () => {
                if (isRunning) {
                  try {
                    await forceStopTimer();
                  } catch (error) {
                    console.error("개인 타이머 강제 종료 실패:", error);
                  }
                }
                setOpenTimerEndModal(false);
                setOpenReview(true);
              }}
            />
          </div>
        </div>
      )}

      {openReview && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenReview(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <ReviewPopup
              groupName={loungeTitle}
              sessionId=""
              onClose={() => setOpenReview(false)}
              onExitGroup={() => void handleFinalExit()}
              isExiting={isExiting}
            />
          </div>
        </div>
      )}

      {openInviteModal && lounge?.groupId && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenInviteModal(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <InviteModal
              groupId={lounge.groupId}
              onClose={() => setOpenInviteModal(false)}
            />
          </div>
        </div>
      )}

      <AlertModal
        isOpen={blockedOpen}
        onClose={handleBlockedClose}
        type="officialLoungeFull"
      />
    </main>
  );
}
