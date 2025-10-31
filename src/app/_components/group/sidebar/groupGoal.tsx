"use client";

import { useState } from "react";
import Icon from "../../common/Icons";
import GoalModal from "../modal/goalModal";

// 아이콘
import Edit from "/Icons/edit.svg";
export default function GroupGoal() {
  const [openGoal, setOpenGoal] = useState(false);

  return (
    <>
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

      {openGoal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenGoal(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <GoalModal onClose={() => setOpenGoal(false)} />
          </div>
        </div>
      )}
    </>
  );
}
