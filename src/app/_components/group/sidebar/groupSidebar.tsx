"use client";

import { useState } from "react";
import Icon from "../../common/Icons";
import GroupMembers from "./groupMembers";
import GroupTimer from "./groupTimer";
import SidebarButton from "./sidebarButton";

// 아이콘
import Add from "/Icons/add.svg";
import Notification from "/Icons/notification.svg";
import NotiModal from "../modal/notiModal";
import GroupGoal from "./groupGoal";

export default function GroupSidebar() {
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

      <GroupGoal></GroupGoal>

      <div className="flex flex-col gap-3 mt-10">
        <h3 className="text-heading4-20SB text-black">그룹 공동 타이머</h3>
        <SidebarButton className="w-full" onClick={() => setOpenNoti(true)}>
          <Icon Svg={Notification} size={24} className="text-black" />
          집중 체크 알림
        </SidebarButton>
        <GroupTimer />
      </div>

      {openNoti && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenNoti(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <NotiModal onClose={() => setOpenNoti(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
