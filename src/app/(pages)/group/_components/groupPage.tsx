"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import GroupFriendField from "./field/groupFriendField";
import Icon from "../../../_components/common/Icons";

import ReviewPopup from "../../../_components/group/review/reviewPopup";
import GroupTimer from "./sidebar/groupTimer";
import GroupGoal from "./sidebar/groupGoal";
import SidebarButton from "./sidebar/sidebarButton";

import Add from "/Icons/add.svg";
import { GroupDetail } from "@/app/_types/groups";

type GroupPageProps = {
  onExitGroup: () => void;
  groupData: GroupDetail;
};

export default function GroupPage({ onExitGroup, groupData }: GroupPageProps) {
  const [openReview, setOpenReview] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const groupMembers = groupData.members;

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
          <GroupTimer
            groupId={groupData.groupId}
            onSessionIdChange={setSessionId}
          />
        </div>
        <GroupGoal data={groupData}></GroupGoal>
      </div>

      <div className="w-full bg-white rounded-2xl px-8 py-4 h-[560px]">
        <div className="flex justify-between mb-2">
          <p className="text-heading4-20R text-gray-600 mb-3">
            <b className="text-black">그룹원</b> {groupMembers.length}/8
          </p>
          <SidebarButton className="px-5 ">
            <Icon Svg={Add} size={24} className="text-black" />
            그룹원 추가하기
          </SidebarButton>
        </div>
        <div className="flex flex-col items-center justify-center">
          {groupMembers.length === 0 ? (
            <div className="text-gray-400 text-heading3-24SB font-semibold flex flex-col justify-center items-center h-[420px] text-center">
              <p>아직 그룹원이 없어요.</p>
              <p>
                <b className="text-red-300">&quot;그룹원 추가하기&quot;</b>를
                눌러 초대해보세요!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-x-5 gap-y-3 h-[420px]">
              {groupMembers.map((f) => (
                <GroupFriendField
                  key={f.userId}
                  status={"active"}
                  friendName={f.nickname}
                  level={1}
                  isPublic={true}
                  activeTime={0}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex mt-3">
          <Button
            onClick={() => setOpenReview(true)}
            leftIconSrc={"/Icons/timerOut.svg"}
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
              groupName={groupData.name}
              sessionId={sessionId || ""}
              onClose={() => setOpenReview(false)}
              onExitGroup={onExitGroup}
            />
          </div>
        </div>
      )}
    </div>
  );
}
