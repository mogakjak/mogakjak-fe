"use client";

import { useState } from "react";
import GroupRoom from "./room/groupRoom";
import { Button } from "@/components/button";
import GroupModal from "../group/groupModal";
import { categoriesData, mates, groups } from "@/app/_utils/mockData";
import { CategoryOption } from "@/app/(pages)/todo/components/categorySelect";
import AddWorkForm from "@/app/(pages)/todo/components/addWorkForm";

type Member = { id: number; isActive: boolean };
type GroupMembers = { id: number; name: string; members: Member[] };
type RoomMainProps = {
  onPage: () => void;
};

export default function RoomMain({ onPage }: RoomMainProps) {
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
        <Button variant="slate600" size="sm" onClick={openGroupFlow}>
          새로운 그룹 생성하기
        </Button>
      </div>

      <div className="h-[320px] overflow-y-auto">
        {groupMembers.length > 0 ? (
          groupMembers.map((g) => <GroupRoom key={g.id} group={g} />)
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            모각작 방이 존재하지 않습니다.
          </div>
        )}
      </div>

      {groupOpen && (
        <GroupModal
          open={groupOpen}
          onClose={() => setGroupOpen(false)}
          findTabGroups={groups}
          mates={mates}
          onNext={() => {
            setGroupOpen(false);
            setPersonalOpen(true);
          }}
        ></GroupModal>
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
            onSubmit={onPage}
            onClose={() => setPersonalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
