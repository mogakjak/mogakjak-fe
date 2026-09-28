"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import HomeGroupRow from "./homeGroupRow";
import RoomModal from "../../room/roomModal";
import InviteModal from "../../room/inviteModal";
import { Button } from "@/components/button";
import { useMyGroups } from "@/app/_hooks/groups/useMyGroups";
import { groupKeys } from "@/app/api/groups/keys";

export default function HomeGroupSection() {
  const [createOpen, setCreateOpen] = useState(false);
  const [createdGroupId, setCreatedGroupId] = useState<string>();

  const queryClient = useQueryClient();
  const { data: myGroups = [], isPending } = useMyGroups();
  const regularGroups = myGroups.filter((group) => !group.isOfficialLounge);

  const handleGroupCreateSuccess = (groupId: string) => {
    queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    setCreatedGroupId(groupId);
  };

  return (
    <div className="w-full flex-1 min-h-0 bg-white rounded-[20px] px-9 pt-7 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-heading4-20SB text-black">
          모여서 각자 작업하는 시간
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCreateOpen(true)}
          leftIconSrc="/Icons/plusDefault.svg"
          disabled={isPending}
        >
          새로운 그룹 생성하기
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2">
        {isPending ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full h-[116px] border-b border-gray-200 p-4 flex items-center gap-4 bg-gray-50"
              >
                <div className="w-[84px] h-[84px] bg-gray-200 rounded-lg" />
                <div className="flex-1 flex flex-col gap-3">
                  <div className="h-[18px] w-1/3 bg-gray-200 rounded-md" />
                  <div className="h-[14px] w-1/4 bg-gray-200 rounded-md" />
                </div>
                <div className="w-[120px] h-[68px] bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : regularGroups.length > 0 ? (
          <div className="flex flex-col pb-4">
            {regularGroups.map((group) => (
              <HomeGroupRow key={group.groupId} group={group} />
            ))}
          </div>
        ) : (
          <p className="flex h-full items-center justify-center text-gray-500 text-lg font-semibold">
            새로운 그룹을 만들고 모각작에 참여해 보세요!
          </p>
        )}
      </div>

      {createOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <RoomModal
            mode="create"
            onClose={() => setCreateOpen(false)}
            onCreateSuccess={handleGroupCreateSuccess}
          />
        </div>
      )}

      {createdGroupId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <InviteModal
            groupId={createdGroupId}
            onClose={() => setCreatedGroupId(undefined)}
          />
        </div>
      )}
    </div>
  );
}
