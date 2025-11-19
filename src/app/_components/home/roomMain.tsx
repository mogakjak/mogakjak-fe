"use client";

import { useState } from "react";
import GroupRoom from "./room/groupRoom";
import { Button } from "@/components/button";
import { categoriesData } from "@/app/_utils/mockData";
import { CategoryOption } from "@/app/(pages)/todo/components/categorySelect";
import AddWorkForm from "@/app/(pages)/todo/components/addWorkForm";
import RoomModal from "./room/roomModal";
import { MyGroup } from "@/app/_types/groups";

type RoomMainProps = {
  groups: MyGroup[];
  isPending: boolean;
};

export default function RoomMain({ groups, isPending }: RoomMainProps) {
  const [groupOpen, setGroupOpen] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(false);

  const openGroupFlow = () => setGroupOpen(true);

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
          disabled={isPending}
        >
          새로운 그룹 생성하기
        </Button>
      </div>

      <div className="h-[320px] overflow-y-auto">
        {isPending ? (
          <div className="flex flex-col gap-4 animate-pulse mt-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="w-full h-[100px] border-b border-gray-200  p-4 flex items-center gap-4 bg-gray-50"
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
        ) : groups.length > 0 ? (
          groups.map((g) => <GroupRoom key={g.groupId} group={g} />)
        ) : (
          <p className="flex h-full items-center justify-center text-gray-500 text-lg font-semibold">
            새로운 그룹을 만들고 모각작에 참여해 보세요!
          </p>
        )}
      </div>

      {groupOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1000]">
          <RoomModal mode="create" onClose={() => setGroupOpen(false)} />
        </div>
      )}

      {personalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1000]">
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
