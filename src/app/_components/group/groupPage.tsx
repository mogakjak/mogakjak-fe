"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import GroupFriendField, {
  GroupFriendFieldProps,
} from "./field/groupFriendField";
import GroupMyField from "./field/groupMyField";
import GroupMySidebar from "./sidebar/groupMySidebar";
import GroupQuote from "./groupQuote";
import GroupSidebar from "./sidebar/groupSidebar";

//아이콘
import ReviewPopup from "../common/review/reviewPopup";
import GainCharacterModal from "../common/gainCharacterModal";

// 더미데이터 삭제예정
export const mockGroupFriends = [
  {
    id: 1,
    status: "active",
    friendName: "가나디",
    avatarSrc: "/character/tomato.svg",
    isPublic: true,
    activeTime: 120,
  },
  {
    id: 2,
    status: "rest",
    friendName: "당근이",
    avatarSrc: "/character/tomato.svg",
    isPublic: true,
    activeTime: 45,
  },
  {
    id: 3,
    status: "active",
    friendName: "브로콜리",
    avatarSrc: "/character/tomato.svg",
    isPublic: false,
    activeTime: 300,
  },
  {
    id: 4,
    status: "end",
    friendName: "양상추",
    avatarSrc: "/character/tomato.svg",
    isPublic: true,
    activeTime: 0,
  },
  {
    id: 5,
    status: "rest",
    friendName: "감자",
    avatarSrc: "/character/tomato.svg",
    isPublic: true,
    activeTime: 210,
  },
  {
    id: 6,
    status: "active",
    friendName: "옥수수",
    avatarSrc: "/character/tomato.svg",
    isPublic: false,
    activeTime: 380,
  },
  {
    id: 7,
    status: "end",
    friendName: "파프리카",
    avatarSrc: "/character/tomato.svg",
    isPublic: true,
    activeTime: 0,
  },
  {
    id: 8,
    status: "rest",
    friendName: "바질",
    avatarSrc: "/character/tomato.svg",
    isPublic: true,
    activeTime: 90,
  },
  {
    id: 9,
    status: "active",
    friendName: "라디쉬",
    avatarSrc: "/character/tomato.svg",
    isPublic: true,
    activeTime: 460,
  },
] satisfies ({ id: number } & GroupFriendFieldProps)[];

export default function GroupPage() {
  const [openReview, setOpenReview] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenReview(false);
    };
    document.addEventListener("keydown", onKey);
    if (openReview) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [openReview]);

  return (
    <div className="flex justify-end items-center w-full">
      <div className="absolute left-0 top-18">
        <GroupSidebar />
      </div>
      <div className="flex flex-col items-center justify-center">
        <GroupQuote></GroupQuote>
        <div className="grid grid-cols-3 gap-x-3 gap-y-5 mt-8">
          {mockGroupFriends.map((f) => (
            <GroupFriendField
              key={f.id}
              status={f.status}
              friendName={f.friendName}
              avatarSrc={f.avatarSrc}
              isPublic={f.isPublic}
              activeTime={f.activeTime}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5 ml-5">
        <div className="flex flex-col gap-2.5">
          <GroupMyField></GroupMyField>
          <GroupMySidebar></GroupMySidebar>
        </div>
        <Button
          onClick={() => setOpenReview(true)}
          className="flex-1"
          leftIcon={null}
        >
          몰입 종류 후 나가기
        </Button>
      </div>

      {openReview && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenReview(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <ReviewPopup onClose={() => setOpenReview(false)} />
          </div>
        </div>
      )}

      {/* 캐릭터 획득 모달 */}
      {/* <div
        className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
        onClick={() => setOpenReview(false)}
      >
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <GainCharacterModal
            onClose={() => setOpenReview(false)}
            hours={1}
          ></GainCharacterModal>
        </div>
      </div> */}
    </div>
  );
}
