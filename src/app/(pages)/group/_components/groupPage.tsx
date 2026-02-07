"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/button";
import GroupFriendField from "./field/groupFriendField";
import Icon from "../../../_components/common/Icons";

import ReviewPopup from "../../../_components/group/review/reviewPopup";
import GroupTimer from "./sidebar/groupTimer";
import GroupGoal from "./sidebar/groupGoal";
import SidebarButton from "./sidebar/sidebarButton";
import InviteModal from "@/app/_components/home/room/inviteModal";
import TimerEndModal from "@/app/_components/common/timerEndModal";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
import { getUserIdFromToken } from "@/app/_lib/getJwtExp";
import { useFinishGroupTimer } from "@/app/_hooks/timers/useFinishGroupTimer";
import { useTimer } from "@/app/_contexts/TimerContext";

import Add from "/Icons/add.svg";
import { GroupDetail } from "@/app/_types/groups";
import { useGroupMemberStatus } from "@/app/_hooks/_websocket/status/useGroupMemberStatus";
import { useSendCheer } from "@/app/_hooks/groups/useSendCheer";
import { useGroupSessionExitGuard } from "@/app/_hooks/groups/useGroupSessionExitGuard";
import { useIsGroupHost } from "@/app/_hooks/groups/useIsGroupHost";
import GroupNoti from "./sidebar/groupNoti";

type GroupPageProps = {
  onExitGroup: () => void;
  groupData: GroupDetail;
  isLoading?: boolean;
  onboardingStep?: number;
};

type TimerStatus = "idle" | "running" | "paused";

export default function GroupPage({
  onExitGroup,
  groupData,
  isLoading = false,
  onboardingStep,
}: GroupPageProps) {
  const [openReview, setOpenReview] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [openTimerEndModal, setOpenTimerEndModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const [pendingRoute, setPendingRoute] = useState<(() => void) | null>(null);

  const finishGroupTimerMutation = useFinishGroupTimer(
    groupData.groupId,
    sessionId || "",
  );

  const { setNavigationInterceptor } = useTimer();
  const { exitSessionOnce } = useGroupSessionExitGuard(groupData.groupId);

  const { token } = useAuthState();

  // 네비게이션 인터셉터 등록
  useEffect(() => {
    // 중요: 함수를 state로 저장할 때는 () => func 형태로 전달해야 함
    setNavigationInterceptor(() => (onConfirm: () => void | Promise<void>) => {
      setPendingRoute(() => onConfirm);
      if (timerStatus === "running" || timerStatus === "paused") {
        setOpenTimerEndModal(true);
      } else {
        setOpenReview(true);
      }
    });
    return () => setNavigationInterceptor(null);
  }, [setNavigationInterceptor, timerStatus]);

  // 뒤로가기 방지 및 모달 띄우기
  useEffect(() => {
    // 마운트 시 현재 상태를 히스토리에 추가 (뒤로가기 함정)
    history.pushState(null, "", location.href);

    const handlePopState = () => {
      // 뒤로가기를 누르면 이 이벤트가 발생함
      // 다시 현재 상태를 push하여 페이지 이동을 막음
      history.pushState(null, "", location.href);

      // 모달 띄우기 로직 실행
      if (timerStatus === "running" || timerStatus === "paused") {
        setOpenTimerEndModal(true);
      } else {
        setOpenReview(true);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [timerStatus]);

  // 최종 나가기 처리 (리뷰 팝업 등에서 호출)
  const handleFinalExit = useCallback(async () => {
    await exitSessionOnce();
    if (pendingRoute) {
      pendingRoute();
    } else {
      onExitGroup();
    }
  }, [exitSessionOnce, pendingRoute, onExitGroup]);

  // 그룹 멤버 상태 관리 훅
  const { memberStatuses, isConnected } = useGroupMemberStatus({
    groupId: groupData.groupId,
    groupData,
  });

  const currentUserId = useMemo(() => {
    return getUserIdFromToken(token);
  }, [token]);

  // 방장 권한 확인 (한 번만 계산)
  const isHost = useIsGroupHost(memberStatuses);

  const sendCheerMutation = useSendCheer(groupData.groupId);

  const handleCheerClick = (targetUserId: string) => {
    sendCheerMutation.mutate(
      { targetUserId },
      {
        onError: (error) => {
          console.error("응원 보내기 실패:", error);
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
    // WebSocket 연결 여부와 상관없이 기본 데이터가 있으면 로드된 것으로 간주하되,
    // WebSocket 업데이트가 오면 실시간 정보를 덧씌움
    if (!isConnected) return true; // 연결 중이어도 이미 groupData가 있으므로 true
    return true;
  }, [isConnected]);

  const participatingMemberCount = useMemo(() => {
    return Array.from(memberStatuses.values()).filter(
      (status) => status.participationStatus !== "NOT_PARTICIPATING",
    ).length;
  }, [memberStatuses]);

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
      <div className="flex gap-5 w-full">
        <div
          className={`flex flex-col gap-3 bg-white px-8 py-5 rounded-2xl ${onboardingStep === 1 ? "border-4 border-red-200" : ""}`}
        >
          <h3 className="text-heading4-20SB text-black">그룹 타이머</h3>
          <GroupTimer
            groupId={groupData.groupId}
            initialAccumulatedDuration={groupData.accumulatedDuration || 0}
            onSessionIdChange={setSessionId}
            onStatusChange={setTimerStatus}
            memberStatuses={memberStatuses}
          />
        </div>
        <div
          className={`w-full ${onboardingStep === 2 ? " rounded-2xl border-4 border-red-200" : ""}`}
        >
          <div className="flex gap-5 h-full">
            <GroupGoal data={groupData} isHost={isHost}></GroupGoal>
            <GroupNoti data={groupData} isHost={isHost}></GroupNoti>
          </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-2xl px-8 pt-8 pb-6 h-[590px] flex flex-col flex-1">
        <div className="flex justify-between mb-2">
          <p className="text-heading4-20R text-gray-600 mb-3">
            <b className="text-black">그룹원</b> {participatingMemberCount}/
            {groupData.members.length}
          </p>
          <SidebarButton
            className={`px-7 py-2 cursor-pointer ${onboardingStep === 3 ? "border-4 border-red-200" : ""}`}
            onClick={() => setOpenInviteModal(true)}
          >
            <Icon Svg={Add} size={24} className="text-gray-800" />
            그룹원 추가하기
          </SidebarButton>
        </div>
        <div className="flex flex-col items-center justify-center">
          {isLoading || !isMemberStatusLoaded ? (
            <div className="grid grid-cols-4 gap-x-5 gap-y-3 min-h-[420px]">
              {Array.from({ length: 8 }).map((_, index) => (
                <GroupFriendField
                  key={`skeleton-${index}`}
                  status="end"
                  level={1}
                  isLoading={true}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-x-5 gap-y-3 min-h-[420px]">
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
                const activeTime =
                  status.personalTimerSeconds !== null &&
                    status.personalTimerSeconds !== undefined
                    ? status.personalTimerSeconds
                    : undefined;

                const isCurrentUser = member.userId === currentUserId;

                // 최근 참여 일수
                const lastActiveAt = status.daysSinceLastParticipation
                  ? new Date(
                    Date.now() -
                    status.daysSinceLastParticipation * 24 * 60 * 60 * 1000,
                  )
                  : undefined;

                return (
                  <div
                    key={member.userId}
                    className={
                      isCurrentUser && onboardingStep === 0
                        ? "border-4 border-red-200 rounded-[20px]"
                        : ""
                    }
                  >
                    <GroupFriendField
                      status={displayStatus}
                      friendName={member.nickname}
                      level={status.level}
                      isPublic={true}
                      activeTime={activeTime}
                      task={status.todoTitle ?? undefined}
                      lastActiveAt={lastActiveAt}
                      profileUrl={member.profileUrl}
                      isCurrentUser={member.userId === currentUserId}
                      isHost={status.role === "HOST"}
                      cheerCount={status.cheerCount || 0}
                      userId={member.userId}
                      groupId={groupData.groupId}
                      onCheerClick={handleCheerClick}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex mt-4">
          <Button
            onClick={() => {
              // 타이머가 실행 중이거나 일시정지 상태면 TimerEndModal 먼저 표시
              if (timerStatus === "running" || timerStatus === "paused") {
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
                if (sessionId && participatingMemberCount <= 1) {
                  try {
                    await finishGroupTimerMutation.mutateAsync();
                    setOpenTimerEndModal(false);
                    setOpenReview(true);
                  } catch (error) {
                    console.error("그룹 타이머 종료 실패:", error);
                  }
                } else {
                  setOpenTimerEndModal(false);
                  setOpenReview(true);
                }
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
              sessionId={sessionId || ""}
              onClose={() => setOpenReview(false)}
              onExitGroup={handleFinalExit}
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
    </div>
  );
}
