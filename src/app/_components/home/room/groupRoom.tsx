"use client";

import { useState } from "react";
import Members from "./members";
import StateButton from "./stateButton";
import HomeButton from "./homeButton";
import MembersHover from "./membersHover";
import Image from "next/image";
import { MyGroup } from "@/app/_types/groups";
import { useRouter } from "next/navigation";
import { useGroupMemberStatus } from "@/app/_hooks/_websocket/status/useGroupMemberStatus";
import { useGroupTimer } from "@/app/_hooks/_websocket/timer/useGroupTimer";
import { getUserIdFromToken } from "@/app/_lib/getJwtExp";
import { useAuthState } from "@/app/_hooks/login/useAuthState";


import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
} from "@floating-ui/react";
import LeavePopup from "./leavePopup";
import LeaveGroupModal from "./leaveGroupModal";
import { useLeaveGroup } from "@/app/_hooks/groups/useLeaveGroup";


type GroupRoomProps = {
  group: MyGroup;
};

export default function GroupRoom({ group }: GroupRoomProps) {
  const router = useRouter();
  const { groupId, groupName, imageUrl, members } = group;
  const { mutate: leaveGroupMutate } = useLeaveGroup();

  // 토큰에서 userId 추출
  const { token } = useAuthState();
  const currentUserId = getUserIdFromToken(token);

  // 본인이 HOST인지 확인
  const isHost = currentUserId && members.some(
    (member) => member.userId === currentUserId && member.role === "HOST"
  );

  // 그룹 타이머 상태 관리
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // 그룹 타이머 이벤트 구독
  useGroupTimer({
    groupId,
    enabled: true,
    onEvent: (event) => {
      if (event.eventType === "START" || event.eventType === "RESUME") {
        setIsTimerRunning(true);
      } else if (event.eventType === "PAUSE" || event.eventType === "FINISH") {
        setIsTimerRunning(false);
      } else if (event.eventType === "SYNC" && event.status === "RUNNING") {
        setIsTimerRunning(true);
      }
    },
  });

  // 그룹 멤버 상태를 기반으로 isActive 계산
  const { membersWithStatus, activeCount } = useGroupMemberStatus({
    groupId,
    members,
    enabled: true,
  });

  const [isEntering, setIsEntering] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: openPopup,
    onOpenChange: setOpenPopup,
    placement: "left",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift()],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const totalCount = members.length;

  const handleEnter = () => {
    setIsEntering(true);
    router.push(`/group/${groupId}`);
  };

  const handleLeaveGroup = () => {
    leaveGroupMutate(groupId, {
      onSuccess: () => {
        setOpenModal(false);
      },
    });
  };

  // imageUrl이 유효한지 확인 (빈 문자열이 아니고, /, http://, https://로 시작하는지)
  const isValidImageUrl = imageUrl && (
    imageUrl.startsWith("/") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  );

  return (
    <div className="flex items-center border-b border-gray-200 px-5 py-4">
      <div className="relative w-[84px] h-[84px] rounded-lg bg-red-200 overflow-hidden">
        {isValidImageUrl ? (
          <Image
            src={imageUrl}
            alt="groupImage"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Image src="/favicon.svg" alt="groupImage" width={40} height={40} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 ml-5">
        <div className="flex items-center gap-2">
          <p className="text-heading4-20SB text-black">{groupName}</p>
          {isHost && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-caption-12M rounded-md">
              방장
            </span>
          )}
        </div>
        <StateButton state={isTimerRunning} />
      </div>

      <div className="flex items-center ml-auto gap-9">
        <div className="flex items-center gap-4">
          <MembersHover
            members={membersWithStatus}
            activeCount={activeCount}
            trigger={
              <Members
                members={membersWithStatus.map((m) => ({
                  id: m.userId,
                  isActive: m.isActive ?? false,
                  profileUrl: m.profileUrl,
                }))}
                size="default"
              />
            }
          />
          <span className="text-body1-16R text-gray-700">
            {activeCount}/{totalCount} 명
          </span>
        </div>
        <div className="flex items-center gap-2">
          <HomeButton
            variant="primary"
            onClick={handleEnter}
            disabled={isEntering}
          >
            {isEntering ? "참여 중..." : "참여하기"}
          </HomeButton>

          <button
            ref={refs.setReference}
            {...getReferenceProps()}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Image src={"/Icons/menuKebab.svg"} alt="menuKebab" width={24} height={24} />
          </button>

          {openPopup && (
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className="z-[70]"
            >
              <LeavePopup
                onLeaveClick={() => {
                  setOpenPopup(false);
                  setOpenModal(true);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <LeaveGroupModal
            groupName={groupName}
            onClose={() => setOpenModal(false)}
            onConfirm={handleLeaveGroup}
          />
        </div>
      )}
    </div>
  );
}
