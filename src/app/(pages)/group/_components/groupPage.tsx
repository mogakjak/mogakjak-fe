"use client";

import { useEffect, useState, useMemo } from "react";
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

import Add from "/Icons/add.svg";
import { GroupDetail } from "@/app/_types/groups";
import { useGroupMemberStatus } from "@/app/_hooks/_websocket/status/useGroupMemberStatus";
import { useSendCheer } from "@/app/_hooks/groups/useSendCheer";

type GroupPageProps = {
  onExitGroup: () => void;
  groupData: GroupDetail;
};

type TimerStatus = "idle" | "running" | "paused";

export default function GroupPage({ onExitGroup, groupData }: GroupPageProps) {
  const [openReview, setOpenReview] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [openTimerEndModal, setOpenTimerEndModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");

  const finishGroupTimerMutation = useFinishGroupTimer(
    groupData.groupId,
    sessionId || ""
  );

  // 그룹 멤버 상태 관리 훅
  const { memberStatuses } = useGroupMemberStatus({
    groupId: groupData.groupId,
    groupData,
  });

  const { token } = useAuthState();

  // 현재 사용자 ID 가져오기
  const currentUserId = useMemo(() => {
    return getUserIdFromToken(token);
  }, [token]);

  // 응원 보내기 훅
  const sendCheerMutation = useSendCheer(groupData.groupId);

  // 응원 버튼 클릭 핸들러
  const handleCheerClick = (targetUserId: string) => {
    sendCheerMutation.mutate(
      { targetUserId },
      {
        onError: (error) => {
          console.error("응원 보내기 실패:", error);
        },
      }
    );
  };

  // 멤버 상태를 기반으로 표시할 멤버 목록 생성 (현재 사용자를 맨 앞으로 정렬)
  const displayMembers = useMemo(() => {
    const membersWithStatus = Array.from(memberStatuses.values()).map(
      (status) => {
        // GroupMemberStatus가 userId, nickname, profileUrl 등 필요한 모든 정보를 포함합니다.
        return {
          userId: status.userId,
          nickname: status.nickname,
          profileUrl: status.profileUrl,
          level: status.level,
          status: status,
        };
      }
    );

    // 현재 사용자를 맨 앞으로 정렬
    if (!currentUserId) return membersWithStatus;

    return [...membersWithStatus].sort((a, b) => {
      if (a.userId === currentUserId) return -1;
      if (b.userId === currentUserId) return 1;
      return 0;
    });
  }, [memberStatuses, currentUserId]);

  // 참여 중인 멤버 수 계산 (NOT_PARTICIPATING이 아닌 멤버)
  const participatingMemberCount = useMemo(() => {
    return Array.from(memberStatuses.values()).filter(
      (status) => status.participationStatus !== "NOT_PARTICIPATING"
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
    <div className="flex flex-col items-center w-full justify-between ">
      <div className="flex gap-5 w-full">
        <div className="flex flex-col gap-3 bg-white px-8 py-5 rounded-2xl">
          <h3 className="text-heading4-20SB text-black">그룹 타이머</h3>
          <GroupTimer
            groupId={groupData.groupId}
            initialAccumulatedDuration={groupData.accumulatedDuration || 0}
            onSessionIdChange={setSessionId}
            onStatusChange={setTimerStatus}
            memberStatuses={memberStatuses}
          />
        </div>
        <GroupGoal data={groupData}></GroupGoal>
      </div>

      <div className="w-full bg-white rounded-2xl px-8 pt-8 pb-6 h-[590px] mt-4">
        <div className="flex justify-between mb-2">
          <p className="text-heading4-20R text-gray-600 mb-3">
            <b className="text-black">그룹원</b> {participatingMemberCount}/
            {groupData.members.length}
          </p>
          <SidebarButton
            className="px-5 cursor-pointer"
            onClick={() => setOpenInviteModal(true)}
          >
            <Icon Svg={Add} size={24} className="text-black" />
            그룹원 추가하기
          </SidebarButton>
        </div>
        <div className="flex flex-col items-center justify-center">
          {displayMembers.length === 0 ? (
            <div className="text-gray-400 text-heading3-24SB font-semibold flex flex-col justify-center items-center h-[420px] text-center">
              <p>아직 그룹원이 없어요.</p>
              <p>
                <b className="text-red-300">&quot;그룹원 추가하기&quot;</b>를
                눌러 초대해보세요!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-x-5 gap-y-3 min-h-[420px]">
              {displayMembers.map((member) => {
                const status = member.status;
                const participationStatus = status.participationStatus;

                // 상태 매핑: PARTICIPATING -> "active", RESTING -> "rest", NOT_PARTICIPATING -> "end"
                let displayStatus: "active" | "rest" | "end";
                if (participationStatus === "PARTICIPATING") {
                  displayStatus = "active";
                } else if (participationStatus === "RESTING") {
                  displayStatus = "rest";
                } else {
                  displayStatus = "end";
                }

                // 개인 타이머 시간 (백엔드에서 초 단위로 전달됨)
                // toSec 함수는 100,000보다 크면 밀리초로 간주하고 1000으로 나누므로,
                // 초 단위 값을 그대로 전달하면 됩니다.
                // 공개 여부에 따라 null이면 undefined로 전달 (비공개일 때 "참여 중" 표시)
                // 백엔드에서 null을 보내면 비공개, 숫자(0 포함)를 보내면 공개
                // null이나 undefined이면 undefined로, 숫자(0 포함)면 그대로 전달
                const activeTime =
                  status.personalTimerSeconds !== null &&
                  status.personalTimerSeconds !== undefined
                    ? status.personalTimerSeconds
                    : undefined;

                // 최근 참여 일수
                const lastActiveAt = status.daysSinceLastParticipation
                  ? new Date(
                      Date.now() -
                        status.daysSinceLastParticipation * 24 * 60 * 60 * 1000
                    )
                  : undefined;

                return (
                  <GroupFriendField
                    key={member.userId}
                    status={displayStatus}
                    friendName={member.nickname}
                    level={status.level}
                    isPublic={true}
                    activeTime={activeTime}
                    task={status.todoTitle ?? undefined}
                    lastActiveAt={lastActiveAt}
                    profileUrl={member.profileUrl}
                    isCurrentUser={member.userId === currentUserId}
                    cheerCount={status.cheerCount || 0}
                    userId={member.userId}
                    groupId={groupData.groupId}
                    onCheerClick={handleCheerClick}
                  />
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
                if (sessionId) {
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
              groupId={groupData.groupId}
              onClose={() => setOpenReview(false)}
              onExitGroup={onExitGroup}
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
