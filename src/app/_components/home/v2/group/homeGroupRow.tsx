"use client";

import Image from "next/image";
import Members from "../../room/members";
import MembersHover from "../../room/membersHover";
import StateButton from "../../room/stateButton";
import HomeButton from "../../room/homeButton";
import GroupRowMenu from "../../room/groupRowMenu";
import type { MyGroup } from "@/app/_types/groups";
import { useGroupRowActions } from "@/app/_hooks/groups/useGroupRowActions";

type HomeGroupRowProps = {
  group: MyGroup;
};

export default function HomeGroupRow({ group }: HomeGroupRowProps) {
  const {
    isHost,
    sortedMembersWithStatus,
    activeCount,
    totalCount,
    groupImageSrc,
    handleEnter,
    isEnterBusy,
    leaveModalOpen,
    openLeaveModal,
    closeLeaveModal,
    confirmLeave,
    hostLeaveBlocked,
  } = useGroupRowActions(group);

  return (
    <div className="flex items-center px-5 py-4 border-b border-gray-200">
      <div className="relative w-[84px] h-[84px] shrink-0 rounded-lg bg-red-200 overflow-hidden">
        {groupImageSrc ? (
          <Image
            src={groupImageSrc}
            alt={group.groupName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Image src="/favicon.svg" alt="" width={40} height={40} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 ml-5 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-heading4-20SB text-black truncate">
            {group.groupName}
          </p>
          {isHost && (
            <Image src="/Icons/king.svg" alt="방장" width={20} height={20} />
          )}
        </div>
        <StateButton state={activeCount >= 1} />
      </div>

      <div className="flex items-center ml-auto gap-6 shrink-0">
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
          <span className="text-body1-16R text-gray-700 whitespace-nowrap">
            {activeCount}/{totalCount} 명
          </span>
        </div>

        <div className="flex items-center gap-2">
          <HomeButton
            variant="primary"
            onClick={() => {
              void handleEnter();
            }}
            disabled={isEnterBusy}
          >
            {isEnterBusy ? "참여 중" : "참여하기"}
          </HomeButton>
          <GroupRowMenu
            groupName={group.groupName}
            isHost={isHost}
            hostLeaveBlocked={hostLeaveBlocked}
            leaveModalOpen={leaveModalOpen}
            onOpenLeaveModal={openLeaveModal}
            onCloseLeaveModal={closeLeaveModal}
            onConfirmLeave={confirmLeave}
          />
        </div>
      </div>
    </div>
  );
}
