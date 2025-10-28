"use client";

import { useState } from "react";
import Icon from "../../common/Icons";
import GroupMembers from "./groupMembers";
import GroupTimer from "./groupTimer";
import SidebarButton from "./sidebarButton";

// 아이콘
import Add from "/Icons/add.svg";
import Edit from "/Icons/edit.svg";
import Notification from "/Icons/notification.svg";
import GoalModal from "../modal/goalModal";
import NotiModal from "../modal/notiModal";

export default function GroupSidebar() {
  const [openGoal, setOpenGoal] = useState(false);
  const [openNoti, setOpenNoti] = useState(false);
  return (
    <div className="min-h-screen bg-white p-9 min-w-[343px]">
      <h2 className="text-heading3-24SB text-red-700">그룹 이름 가나다라</h2>

      <div className="flex items-center justify-between mt-5 gap-2 mb-6">
        <p className="text-gray-600 flex gap-2 text-heading4-20R">
          <b className="text-black text-heading4-20SB">그룹원</b> n/n
        </p>
        <SidebarButton className="px-3.5">
          <Icon Svg={Add} size={24} className="text-black" />
          메이트 초대하기
        </SidebarButton>
      </div>

      <GroupMembers />

      <div className="flex flex-col mt-5 py-5 border-t border-b border-gray-200">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-heading4-20SB text-black">그룹 공동 목표</h3>
          <button onClick={() => setOpenGoal(true)}>
            <Icon Svg={Edit} size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="flex gap-10 items-center justify-center mt-[27px]">
          <div className="flex flex-col items-center">
            <p className="text-body2-14R text-gray-600">목표 시간</p>
            <p className="text-heading3-24SB text-gray-800">0h 00m</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-body2-14R text-gray-600">달성률</p>
            <p className="text-heading3-24SB text-red-500">0%</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-10">
        <h3 className="text-heading4-20SB text-black">그룹 공동 타이머</h3>
        <SidebarButton className="w-full" onClick={() => setOpenNoti(true)}>
          <Icon Svg={Notification} size={24} className="text-black" />
          집중 체크 알림
        </SidebarButton>
        <GroupTimer />
      </div>

      {openGoal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenGoal(false)}
        >
          <GoalModal onClose={() => setOpenGoal(false)} />
        </div>
      )}

      {openNoti && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenNoti(false)}
        >
          <NotiModal onClose={() => setOpenNoti(false)} />
        </div>
      )}
    </div>
  );
}
