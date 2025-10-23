"use client";

import GroupRoom from "./room/groupRoom";
import { Button } from "@/components/button";

type Member = { id: number; isActive: boolean };
type Group = { id: number; name: string; members: Member[] };

export default function RoomMain() {
  const groups: Group[] = [
    {
      id: 101,
      name: "CS 스터디 A조",
      members: [
        { id: 1, isActive: true },
        { id: 2, isActive: false },
        { id: 3, isActive: false },
        { id: 4, isActive: true },
        { id: 5, isActive: true },
        { id: 6, isActive: true },
        { id: 7, isActive: true },
      ],
    },
    {
      id: 102,
      name: "알고리즘 저녁반",
      members: [
        { id: 1, isActive: true },
        { id: 2, isActive: true },
        { id: 3, isActive: true },
      ],
    },
    {
      id: 107,
      name: "코테 연습",
      members: [
        { id: 1, isActive: true },
        { id: 2, isActive: true },
        { id: 3, isActive: false },
        { id: 4, isActive: true },
        { id: 5, isActive: true },
      ],
    },
  ];

  return (
    <div className="w-full p-6 pb-0 bg-white rounded-[20px]">
      <div className="flex justify-between mb-4">
        <h2 className="text-heading4-20SB text-black">
          모각작 함께 몰입하는 시간
        </h2>
        <Button variant="slate600" size="sm">
          새로운 그룹 생성하기
        </Button>
      </div>

      <div className="h-[380px] overflow-y-auto">
        <GroupRoom variant="guide" />
        {groups.map((g) => (
          <GroupRoom key={g.id} group={g} />
        ))}
      </div>
    </div>
  );
}
