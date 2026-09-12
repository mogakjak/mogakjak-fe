"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/button";
import GroupFriendField from "./field/groupFriendField";
import Icon from "../../../_components/common/Icons";

import ReviewPopup from "../../../_components/group/review/reviewPopup";
import GroupQuote from "./sidebar/groupQuote";
import GroupPresence from "./sidebar/groupPresence";
import SidebarButton from "./sidebar/sidebarButton";
import InviteModal from "@/app/_components/home/room/inviteModal";
import KickMemberModal from "@/app/_components/home/room/kickMemberModal";
import TimerEndModal from "@/app/_components/common/timerEndModal";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
import { getUserIdFromToken } from "@/app/_lib/getJwtExp";
import { useTimer } from "@/app/_contexts/TimerContext";

import Add from "/Icons/add.svg";
import { GroupDetail } from "@/app/_types/groups";
import { useGroupMemberStatus } from "@/app/_hooks/_websocket/status/useGroupMemberStatus";
import { useSendCheer } from "@/app/_hooks/groups/useSendCheer";
import { useKickGroupMember } from "@/app/_hooks/groups/useKickGroupMember";
import { useGroupSessionExitGuard } from "@/app/_hooks/groups/useGroupSessionExitGuard";
import { useIsGroupHost } from "@/app/_hooks/groups/useIsGroupHost";
import GroupNoti from "./sidebar/groupNoti";
import { sendGAEvent } from "@next/third-parties/google";
import { useSelectedTodoActualSeconds } from "@/app/_hooks/todo/useSelectedTodoActualSeconds";

type GroupPageProps = {
  onExitGroup: () => void;
  groupData: GroupDetail;
  isLoading?: boolean;
  onboardingStep?: number;
};

export default function GroupPage({
  onExitGroup,
  groupData,
  isLoading = false,
  onboardingStep,
}: GroupPageProps) {
  const [openReview, setOpenReview] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [openTimerEndModal, setOpenTimerEndModal] = useState(false);
  const [kickTarget, setKickTarget] = useState<{
    userId: string;
    nickname: string;
  } | null>(null);
  const [pendingRoute, setPendingRoute] = useState<(() => void) | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const isExitingRef = useRef(false);

  const { setNavigationInterceptor, isRunning, forceStopTimer } = useTimer();
  const { exitSessionOnce } = useGroupSessionExitGuard(groupData.groupId);

  const { token } = useAuthState();

  useEffect(() => {
    setNavigationInterceptor(() => (onConfirm: () => void | Promise<void>) => {
      setPendingRoute(() => onConfirm);
      if (isRunning) {
        setOpenTimerEndModal(true);
      } else {
        setOpenReview(true);
      }
    });
    return () => setNavigationInterceptor(null);
  }, [setNavigationInterceptor, isRunning]);

  useEffect(() => {
    history.pushState(null, "", location.href);

    const handlePopState = () => {
      history.pushState(null, "", location.href);

      if (isRunning) {
        setOpenTimerEndModal(true);
      } else {
        setOpenReview(true);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isRunning]);

  const handleFinalExit = useCallback(async () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    setIsExiting(true);

    try {
      const enterTimeStr = sessionStorage.getItem(
        `group_enter_time_${groupData.groupId}`,
      );
      if (enterTimeStr) {
        const enterTime = Number(enterTimeStr);
        const stayDurationSeconds = Math.floor((Date.now() - enterTime) / 1000);

        sendGAEvent("event", "group_stay_duration", {
          value: stayDurationSeconds,
        });

        sessionStorage.removeItem(`group_enter_time_${groupData.groupId}`);
      }

      await exitSessionOnce();
      if (pendingRoute) {
        pendingRoute();
      } else {
        onExitGroup();
      }
    } catch (error) {
      console.error("나가기 처리 실패:", error);
      isExitingRef.current = false;
      setIsExiting(false);
    }
  }, [exitSessionOnce, pendingRoute, onExitGroup, groupData.groupId]);

  const { memberStatuses, isConnected } = useGroupMemberStatus({
    groupId: groupData.groupId,
    groupData,
  });

  const currentUserId = useMemo(() => {
    return getUserIdFromToken(token);
  }, [token]);

  const myTodoActual = useSelectedTodoActualSeconds();
  const isHost = useIsGroupHost(memberStatuses);

  const sendCheerMutation = useSendCheer(groupData.groupId);
  const kickMemberMutation = useKickGroupMember();

  const handleCheerClick = (targetUserId: string) => {
    sendGAEvent("event", "cheer_click");
    sendCheerMutation.mutate(
      { targetUserId },
      {
        onError: (error) => {
          console.error("응원 보내기 실패:", error);
        },
      },
    );
  };

  const handleKickClick = (userId: string, nickname: string) => {
    setKickTarget({ userId, nickname });
  };

  const handleConfirmKick = () => {
    if (!kickTarget) return;
    kickMemberMutation.mutate(
      { groupId: groupData.groupId, targetUserId: kickTarget.userId },
      {
        onSuccess: () => {
          setKickTarget(null);
        },
        onError: (error) => {
          console.error("멤버 내보내기 실패:", error);
          alert(
            error instanceof Error
              ? error.message
              : "멤버 내보내기에 실패했습니다.",
          );
        },
      },
    );
  };

  const displayMembers = useMemo(() => {
    const membersWithStatus = Array.from(memberStatuses.values()).map(
      (status) => {
        return {
          userId: status.userId,
          nickname: status.nickname,
          profileUrl: status.profileUrl,
          level: status.level,
          status: status,
        };
      },
    );
    if (!currentUserId) return membersWithStatus;

    return [...membersWithStatus].sort((a, b) => {
      if (a.userId === currentUserId) return -1;
      if (b.userId === currentUserId) return 1;
      return 0;
    });
  }, [memberStatuses, currentUserId]);

  const isMemberStatusLoaded = useMemo(() => {
    if (!isConnected) return true;
    return true;
  }, [isConnected]);

  const realtimeParticipatingMemberCount = useMemo(() => {
    return Array.from(memberStatuses.values()).filter(
      (status) => status.participationStatus !== "NOT_PARTICIPATING",
    ).length;
  }, [memberStatuses]);

  const participatingMemberCount =
    realtimeParticipatingMemberCount ||
    groupData.participatingMemberCount ||
    0;

  const totalMemberCount =
    groupData.totalMemberCount ?? groupData.members.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenReview(false);
    };
    document.addEventListener("keydown", onKey);
    if (openReview) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [openReview]);

  return (
    <div className="flex flex-col items-center w-full gap-5">
      <div className="flex w-full gap-5">
        <div
          className={`min-w-0 flex-3 ${onboardingStep === 1 ? "rounded-2xl border-4 border-red-200 shadow-[0_0_30px_5px_rgba(0,0,0,0.2)]" : ""}`}
        >
          <GroupQuote />
        </div>
        <div
          className={`min-w-0 flex-3 ${onboardingStep === 2 ? "rounded-2xl border-4 border-red-200 shadow-[0_0_30px_5px_rgba(0,0,0,0.2)]" : ""}`}
        >
          <GroupPresence
            participatingMemberCount={participatingMemberCount}
            totalMemberCount={totalMemberCount}
          />
        </div>
        <div
          className={`min-w-0 flex-2 ${onboardingStep === 2 ? "rounded-2xl border-4 border-red-200 shadow-[0_0_30px_5px_rgba(0,0,0,0.2)]" : ""}`}
        >
          <GroupNoti
            data={groupData}
            isHost={isHost}
            isOnboarding={onboardingStep !== undefined}
          />
        </div>
      </div>

      <div className="w-full bg-white rounded-2xl px-8 pt-8 pb-6 h-[590px] flex flex-col flex-1">
        <div className="flex justify-between mb-2">
          <p className="text-heading4-20R text-gray-600 mb-3">
            <b className="text-black">그룹원</b> {participatingMemberCount}/
            {totalMemberCount}
          </p>
          <SidebarButton
            className={`px-7 py-2 cursor-pointer ${onboardingStep === 3 ? "border-4 border-red-200 shadow-[0_0_30px_5px_rgba(0,0,0,0.2)] font-bold" : ""}`}
            onClick={() => setOpenInviteModal(true)}
          >
            <Icon Svg={Add} size={24} className="text-gray-800" />
            그룹원 추가하기
          </SidebarButton>
        </div>
        <div className="flex flex-col items-center justify-center w-full flex-1 min-h-0">
          {isLoading || !isMemberStatusLoaded ? (
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
                {displayMembers.map((member) => {
                  const status = member.status;
                  const participationStatus = status.participationStatus;

                  let displayStatus: "active" | "rest" | "end";
                  if (participationStatus === "PARTICIPATING") {
                    displayStatus = "active";
                  } else if (participationStatus === "RESTING") {
                    displayStatus = "rest";
                  } else {
                    displayStatus = "end";
                  }
                  const isCurrentUser = member.userId === currentUserId;
                  const todoActual = status.todo?.actualTimeInSeconds;
                  const activeTime =
                    isCurrentUser && myTodoActual.hasTodo
                      ? myTodoActual.actualSeconds
                      : todoActual !== null && todoActual !== undefined
                        ? todoActual
                        : undefined;

                  const lastActiveAt = status.daysSinceLastParticipation
                    ? new Date(
                        Date.now() -
                          status.daysSinceLastParticipation *
                            24 *
                            60 *
                            60 *
                            1000,
                      )
                    : undefined;

                  return (
                    <div
                      key={member.userId}
                      className={
                        isCurrentUser && onboardingStep === 0
                          ? "border-4 border-red-200 rounded-[20px] shadow-[0_0_30px_5px_rgba(0,0,0,0.2)]"
                          : ""
                      }
                    >
                      <GroupFriendField
                        status={displayStatus}
                        friendName={member.nickname}
                        level={status.level}
                        isPublic={true}
                        activeTime={activeTime}
                        todoId={
                          isCurrentUser && myTodoActual.hasTodo
                            ? myTodoActual.todoId
                            : status.todo?.id
                        }
                        disableLiveTick={isCurrentUser && myTodoActual.hasTodo}
                        task={
                          isCurrentUser && myTodoActual.hasTodo
                            ? myTodoActual.taskTitle
                            : (status.todo?.title ??
                              status.todoTitle ??
                              undefined)
                        }
                        lastActiveAt={lastActiveAt}
                        profileUrl={member.profileUrl}
                        isCurrentUser={member.userId === currentUserId}
                        isHost={status.role === "HOST"}
                        cheerCount={status.cheerCount || 0}
                        userId={member.userId}
                        groupId={groupData.groupId}
                        onCheerClick={handleCheerClick}
                        canKick={
                          isHost && !isCurrentUser && status.role !== "HOST"
                        }
                        onKickClick={handleKickClick}
                      />
                    </div>
                  );
                })}
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
            leftIconSrc={"/Icons/timerOut.svg"}
            size="custom"
            className="text-body1-16SB h-11 px-5 text-base rounded-2xl ml-auto"
          >
            몰입 종료 후 나가기
          </Button>
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
              groupName={groupData.name}
              sessionId=""
              onClose={() => setOpenReview(false)}
              onExitGroup={handleFinalExit}
              isExiting={isExiting}
            />
          </div>
        </div>
      )}

      {openInviteModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenInviteModal(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <InviteModal
              groupId={groupData.groupId}
              onClose={() => setOpenInviteModal(false)}
            />
          </div>
        </div>
      )}

      {kickTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-100">
          <KickMemberModal
            memberName={kickTarget.nickname}
            isPending={kickMemberMutation.isPending}
            onClose={() => setKickTarget(null)}
            onConfirm={handleConfirmKick}
          />
        </div>
      )}
    </div>
  );
}
