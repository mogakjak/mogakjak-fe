"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Members from "./members";
import StateButton from "./stateButton";
import HomeButton from "./homeButton";
import MembersHover from "./membersHover";
import Image from "next/image";
import { MyGroup } from "@/app/_types/groups";
import { useRouter } from "next/navigation";
import { useGroupMemberStatus } from "@/app/_hooks/_websocket/status/useGroupMemberStatus";
import { getUserIdFromToken } from "@/app/_lib/getJwtExp";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
import { useEnterOfficialLounge } from "@/app/_hooks/lounge/useEnterOfficialLounge";
import { loungeKeys } from "@/app/api/lounge/keys";
import { groupKeys } from "@/app/api/groups/keys";
import AlertModal from "@/app/_components/common/timer/alertModal";

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

/** HomeButton(120px) + gap-2(8px) + 케밥(p-1+24+p-1 ≈32px) — 공식 라운지에서 케밥 없어도 같은 폭 유지 */
const ACTION_ROW_MIN_WIDTH = "min-w-[160px]";

type GroupRoomProps = {
  group: MyGroup;
};

export default function GroupRoom({ group }: GroupRoomProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isOfficial = group.isOfficialLounge === true;
  const { groupId, groupName, imageUrl, members } = group;
  const { mutate: leaveGroupMutate } = useLeaveGroup();
  const enterOfficialMutation = useEnterOfficialLounge();
  const [blockedOpen, setBlockedOpen] = useState(false);

  const { token } = useAuthState();
  const currentUserId = getUserIdFromToken(token);

  const isHost =
    !isOfficial &&
    Boolean(
      currentUserId &&
        members.some(
          (m) => m.userId === currentUserId && m.role === "HOST"
        )
    );

  const { membersWithStatus, activeCount } = useGroupMemberStatus({
    groupId,
    members,
    enabled: true,
  });
  const sortedMembersWithStatus = [...membersWithStatus].sort((a, b) => {
    return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
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

  const handleLeaveGroup = () => {
    leaveGroupMutate(groupId, {
      onSuccess: () => {
        setOpenModal(false);
      },
    });
  };

  const isValidImageUrl =
    imageUrl &&
    (imageUrl.startsWith("/") ||
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://"));
  const isOfficialLoungeProfileGroup =
    groupId === "ac120006-9d7c-1377-819d-7c8397700000";
  const groupImageSrc: string | null = isOfficialLoungeProfileGroup
    ? "/loungeProfile.svg"
    : isValidImageUrl
      ? imageUrl
      : null;

  const isEnterBusy = isOfficial
    ? enterOfficialMutation.isPending
    : isEntering;

  return (
    <div className="flex items-center border-b border-gray-200 px-5 py-4">
      <div className="relative w-[84px] h-[84px] rounded-lg bg-red-200 overflow-hidden">
        {groupImageSrc ? (
          <Image
            src={groupImageSrc}
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
            <Image
              src="/Icons/king.svg"
              alt="방장"
              width={20}
              height={20}
            />
          )}
        </div>
        <StateButton state={activeCount >= 1} />
      </div>

      <div className="flex items-center ml-auto gap-9">
        <div className="flex items-center gap-4">
          <MembersHover
            members={sortedMembersWithStatus}
            activeCount={activeCount}
            trigger={
              <Members
                members={sortedMembersWithStatus.map((m) => ({
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
        <div
          className={`flex items-center justify-end gap-2 shrink-0 ${ACTION_ROW_MIN_WIDTH}`}
        >
          <HomeButton
            variant="primary"
            onClick={() => {
              void handleEnter();
            }}
            disabled={isEnterBusy}
          >
            {isEnterBusy ? "참여 중" : "참여하기"}
          </HomeButton>

          {!isOfficial ? (
            <>
              <button
                type="button"
                ref={refs.setReference}
                {...getReferenceProps()}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              >
                <Image
                  src="/Icons/menuKebab.svg"
                  alt="메뉴"
                  width={24}
                  height={24}
                />
              </button>

              {openPopup && (
                <div
                  ref={refs.setFloating}
                  style={floatingStyles}
                  {...getFloatingProps()}
                  className="z-70"
                >
                  <LeavePopup
                    onLeaveClick={() => {
                      setOpenPopup(false);
                      setOpenModal(true);
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div
              className="p-1 shrink-0 rounded-full box-border flex items-center justify-center"
              aria-hidden
            >
              <span className="size-6 block" />
            </div>
          )}
        </div>
      </div>

      {openModal && !isOfficial && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-100">
          <LeaveGroupModal
            groupName={groupName}
            onClose={() => setOpenModal(false)}
            onConfirm={handleLeaveGroup}
          />
        </div>
      )}

      {isOfficial && (
        <AlertModal
          isOpen={blockedOpen}
          onClose={() => setBlockedOpen(false)}
          type="officialLoungeFull"
        />
      )}
    </div>
  );
}
