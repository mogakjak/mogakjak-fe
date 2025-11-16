"use client";

import { useState } from "react";
import GroupRoom from "./room/groupRoom";
import { Button } from "@/components/button";
import { categoriesData } from "@/app/_utils/mockData";
import { CategoryOption } from "@/app/(pages)/todo/components/categorySelect";
import AddWorkForm from "@/app/(pages)/todo/components/addWorkForm";
import RoomModal from "./room/roomModal";

type Member = { id: number; isActive: boolean };
type GroupMembers = { id: number; name: string; members: Member[] };

export default function RoomMain() {
  const [groupOpen, setGroupOpen] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(false);

  const openGroupFlow = () => {
    setGroupOpen(true);
  };

  const groupMembers: GroupMembers[] = [];

  return (
    <div className="w-full p-6 pb-0 bg-white rounded-[20px]">
      <div className="flex justify-between mb-2">
        <h2 className="text-heading4-20SB text-black">
          모각작 함께 몰입하는 시간
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={openGroupFlow}
          leftIconSrc="/Icons/plusDefault.svg"
        >
          새로운 그룹 생성하기
        </Button>
      </div>

      <div className="h-[320px] overflow-y-auto">
        {groupMembers.length > 0 ? (
          groupMembers.map((g) => <GroupRoom key={g.id} group={g} />)
        ) : (
          <p className="flex h-full items-center justify-center text-gray-500 text-lg font-semibold">
            새로운 그룹을 만들고 모각작에 참여해 보세요!
          </p>
        )}
      </div>

      {groupOpen && (
        <div className="z-[1000] fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <RoomModal mode="create" onClose={() => setGroupOpen(false)} />
        </div>
      )}

      {personalOpen && (
        <div className="z-[1000] fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <AddWorkForm
            type="select"
            categories={categoriesData.map((c) => ({
              id: String(c.id),
              name: c.title,
              colorToken: "category-1-red" as CategoryOption["colorToken"],
            }))}
            onClose={() => setPersonalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
