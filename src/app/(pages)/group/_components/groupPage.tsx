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
import { useAuthState } from "@/app/api/auth/useAuthState";
import { getUserIdFromToken } from "@/app/_lib/getJwtExp";

import Add from "/Icons/add.svg";
import { GroupDetail, GroupMemberStatus } from "@/app/_types/groups";
import { useGroupMemberStatus } from "@/app/_hooks/useGroupMemberStatus";

type GroupPageProps = {
  onExitGroup: () => void;
  groupData: GroupDetail;
};

export default function GroupPage({ onExitGroup, groupData }: GroupPageProps) {
  const [openReview, setOpenReview] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [memberStatuses, setMemberStatuses] = useState<
    Map<string, GroupMemberStatus>
  >(new Map());

  // 초기 멤버 상태 설정
  useEffect(() => {
    const initialStatuses = new Map<string, GroupMemberStatus>();
    groupData.members.forEach((member) => {
      initialStatuses.set(member.userId, {
        groupId: groupData.groupId,
        userId: member.userId,
        nickname: member.nickname,
        profileUrl: member.profileUrl,
        level: member.level || 1,
        participationStatus: "NOT_PARTICIPATING",
      });
    });
    setMemberStatuses(initialStatuses);
  }, [groupData.groupId, groupData.members]);

  // 웹소켓으로 그룹 멤버 상태 구독
  useGroupMemberStatus({
    groupId: groupData.groupId,
    enabled: true,
    onUpdate: (update) => {
      setMemberStatuses((prev) => {
        const next = new Map(prev);

        if (update.members) {
          // 전체 멤버 목록 업데이트
          update.members.forEach((member) => {
            next.set(member.userId, member);
          });
        } else if (update.updatedMember) {
          // 단일 멤버 상태 업데이트
          next.set(update.updatedMember.userId, update.updatedMember);
        }

        return next;
      });
    },
  });

  const { token } = useAuthState();

  // 현재 사용자 ID 가져오기
  const currentUserId = useMemo(() => {
    return getUserIdFromToken(token);
  }, [token]);

  // 멤버 상태를 기반으로 표시할 멤버 목록 생성 (현재 사용자를 맨 앞으로 정렬)
  // memberStatuses를 기반으로 생성하여 웹소켓으로 업데이트되는 실시간 변경사항 반영
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
    <div className="flex flex-col items-center w-full justify-between">
      <div className="flex gap-5 w-full">
        <div className="flex flex-col gap-3 bg-white px-8 py-5 rounded-2xl">
          <h3 className="text-heading4-20SB text-black">그룹 타이머</h3>
          <GroupTimer
            groupId={groupData.groupId}
            onSessionIdChange={setSessionId}
          />
        </div>
        <GroupGoal data={groupData}></GroupGoal>
      </div>

      <div className="w-full bg-white rounded-2xl px-8 py-4 h-[560px]">
        <div className="flex justify-between mb-2">
          <p className="text-heading4-20R text-gray-600 mb-3">
            <b className="text-black">그룹원</b> {displayMembers.length}/8
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
            <div className="grid grid-cols-4 gap-x-5 gap-y-3 h-[420px]">
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
                const activeTime = status.personalTimerSeconds || 0;

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
                    task={status.todoTitle}
                    lastActiveAt={lastActiveAt}
                    profileUrl={member.profileUrl}
                    isCurrentUser={member.userId === currentUserId}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="flex mt-3">
          <Button
            onClick={() => setOpenReview(true)}
            leftIconSrc={"/Icons/timerOut.svg"}
            size="custom"
            className="text-body1-16SB h-11 px-5 text-base rounded-2xl ml-auto"
          >
            몰입 종료 후 나가기
          </Button>
        </div>
      </div>

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
