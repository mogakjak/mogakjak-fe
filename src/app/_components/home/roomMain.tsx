"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import GroupRoom from "./room/groupRoom";
import { Button } from "@/components/button";
import RoomModal from "./room/roomModal";
import InviteModal from "./room/inviteModal";
import { useMyGroups } from "@/app/_hooks/groups/useMyGroups";
import { groupKeys } from "@/app/api/groups/keys";

type RoomMainProps = {
  isPending: boolean;
  highlightButton?: boolean;
  onButtonClick?: () => void;
  disableInternalModal?: boolean;
};

export default function RoomMain({ isPending, highlightButton, onButtonClick, disableInternalModal }: RoomMainProps) {
  const [groupOpen, setGroupOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createdGroupId, setCreatedGroupId] = useState<string | undefined>();

  const queryClient = useQueryClient();
  const { data: myGroups = [], isLoading: groupsLoading } = useMyGroups();

  const handleGroupCreateSuccess = (groupId: string) => {
    // 그룹 생성 후 갱신 
    queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    setCreatedGroupId(groupId);
    setInviteModalOpen(true);
  };

  return (
    <div className="w-full p-9 pb-0 bg-white rounded-[20px]">
      <div className="flex justify-between mb-2">
        <h2 className="text-heading4-20SB text-black">
          모여서 각자 작업하는 시간
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (onButtonClick) {
              onButtonClick();
            } else {
              setGroupOpen(true);
            }
          }}
          leftIconSrc="/Icons/plusDefault.svg"
          disabled={isPending && !highlightButton}
          className={highlightButton ? "border-2 border-red-500" : ""}
        >
          새로운 그룹 생성하기
        </Button>
      </div>

      <div className="h-[320px] overflow-y-auto">
        {groupsLoading || isPending ? (
          <div className="flex flex-col gap-4 animate-pulse mt-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="w-full h-[100px] border-b border-gray-200 p-4 flex items-center gap-4 bg-gray-50"
              >
                <div className="w-[60px] h-[60px] bg-gray-200 rounded-lg" />
                <div className="flex-1 flex flex-col gap-3">
                  <div className="h-[18px] w-1/3 bg-gray-200 rounded-md" />
                  <div className="h-[14px] w-1/4 bg-gray-200 rounded-md" />
                </div>
                <div className="w-[100px] h-[50px] bg-gray-200 rounded-md" />
              </div>
            ))}
          </div>
        ) : myGroups.length > 0 ? (
          myGroups.map((g) => <GroupRoom key={g.groupId} group={g} />)
        ) : (
          <p className="flex h-full items-center justify-center text-gray-500 text-lg font-semibold">
            새로운 그룹을 만들고 모각작에 참여해 보세요!
          </p>
        )}
      </div>

      {groupOpen && !disableInternalModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <RoomModal
            mode="create"
            onClose={() => setGroupOpen(false)}
            onCreateSuccess={handleGroupCreateSuccess}
          />
        </div>
      )}

      {inviteModalOpen && createdGroupId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <InviteModal
            groupId={createdGroupId}
            onClose={() => {
              setInviteModalOpen(false);
              setCreatedGroupId(undefined);
            }}
          />
        </div>
      )}
    </div>
  );
}
