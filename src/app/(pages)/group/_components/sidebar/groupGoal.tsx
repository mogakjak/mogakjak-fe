"use client";

import { useState } from "react";
import Icon from "../../../../_components/common/Icons";

import SidebarButton from "./sidebarButton";
import Notification from "/Icons/notification.svg";
import NotiModal from "../../../../_components/group/modal/notiModal";

export default function GroupGoal() {
  const [openNoti, setOpenNoti] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3 bg-white px-8 py-6 rounded-2xl flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-heading4-20SB text-black">그룹 공동 목표</h3>
          <SidebarButton className="px-7" onClick={() => setOpenNoti(true)}>
            <Icon Svg={Notification} size={24} className="text-black" />
            집중 체크 알림
          </SidebarButton>
        </div>

        <div className="flex gap-10 items-center justify-center mt-4">
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
    </>
  );
}
