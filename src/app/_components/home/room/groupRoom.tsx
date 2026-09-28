"use client";

import Members from "./members";
import StateButton from "./stateButton";
import HomeButton from "./homeButton";
import MembersHover from "./membersHover";
import GroupRowMenu from "./groupRowMenu";
import Image from "next/image";
import { MyGroup } from "@/app/_types/groups";
import AlertModal from "@/app/_components/common/timer/alertModal";
import { useGroupRowActions } from "@/app/_hooks/groups/useGroupRowActions";

/** HomeButton(120px) + gap-2(8px) + 케밥(p-1+24+p-1 ≈32px) — 공식 라운지에서 케밥 없어도 같은 폭 유지 */
const ACTION_ROW_MIN_WIDTH = "min-w-[160px]";

type GroupRoomProps = {
  group: MyGroup;
};

export default function GroupRoom({ group }: GroupRoomProps) {
  const { groupName } = group;
  const {
    isOfficial,
    isHost,
    sortedMembersWithStatus,
    activeCount,
    totalCount,
    groupImageSrc,
    handleEnter,
    isEnterBusy,
    blockedOpen,
    closeBlocked,
    leaveModalOpen,
    openLeaveModal,
    closeLeaveModal,
    confirmLeave,
    hostLeaveBlocked,
  } = useGroupRowActions(group);

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
            <GroupRowMenu
              groupName={groupName}
              isHost={isHost}
              hostLeaveBlocked={hostLeaveBlocked}
              leaveModalOpen={leaveModalOpen}
              onOpenLeaveModal={openLeaveModal}
              onCloseLeaveModal={closeLeaveModal}
              onConfirmLeave={confirmLeave}
            />
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

      {isOfficial && (
        <AlertModal
          isOpen={blockedOpen}
          onClose={closeBlocked}
          type="officialLoungeFull"
        />
      )}
    </div>
  );
}
