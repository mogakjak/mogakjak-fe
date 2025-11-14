"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import GroupFriendField from "./field/groupFriendField";
import Icon from "../common/Icons";

import ReviewPopup from "../common/review/reviewPopup";
import { mockGroupFriends } from "@/app/_utils/mockData";
import GroupTimer from "./sidebar/groupTimer";
import GroupGoal from "./sidebar/groupGoal";
import SidebarButton from "./sidebar/sidebarButton";

import Add from "/Icons/add.svg";

type GroupPageProps = {
  onExitGroup: () => void;
};

export default function GroupPage({ onExitGroup }: GroupPageProps) {
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
    <div className="flex flex-col items-center w-full justify-between">
      <div className="flex gap-5 w-full">
        <div className="flex flex-col gap-3 bg-white px-8 py-5 rounded-2xl">
          <h3 className="text-heading4-20SB text-black">그룹 타이머</h3>
          <GroupTimer />
        </div>
        <GroupGoal></GroupGoal>
      </div>

      <div className="bg-white rounded-2xl px-8 py-5">
        <div className="flex justify-between mb-2">
          <p className="text-heading4-20R text-gray-600 mb-3">
            <b className="text-black">그룹원</b> 3/8
          </p>
          <SidebarButton className="px-5">
            <Icon Svg={Add} size={24} className="text-black" />
            그룹원 추가하기
          </SidebarButton>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="grid grid-cols-4 gap-x-5 gap-y-3">
            {mockGroupFriends.map((f) => (
              <GroupFriendField
                key={f.id}
                status={f.status}
                friendName={f.friendName}
                level={f.level}
                isPublic={f.isPublic}
                activeTime={f.activeTime}
              />
            ))}
          </div>
        </div>

        <div className="flex mt-3">
          <Button
            onClick={() => setOpenReview(true)}
            leftIcon={null}
            size="custom"
            className="text-body1-16SB h-11 px-5 text-base rounded-2xl ml-auto"
          >
            몰입 종료 후 나가기
          </Button>
        </div>
      </div>

      {openReview && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenReview(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <ReviewPopup
              onClose={() => setOpenReview(false)}
              onExitGroup={onExitGroup}
            />
          </div>
        </div>
      )}
    </div>
  );
}
