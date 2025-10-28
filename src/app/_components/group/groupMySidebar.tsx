"use client";

import { useState } from "react";

import Icon from "../common/Icons";

// 아이콘
import Edit from "/Icons/edit.svg";
import EyesOpen from "/Icons/eyesOpen.svg";
import EyesClosed from "/Icons/eyesClosed.svg";

export default function GroupMySidebar() {
  const [isTaskOpen, setIsTaskOpen] = useState(true);
  const [isTimeOpen, setIsTimeOpen] = useState(true);

  const toggleTaskEye = () => setIsTaskOpen((prev) => !prev);
  const toggleTimeEye = () => setIsTimeOpen((prev) => !prev);

  return (
    <div className="p-5 bg-white w-[238px] h-[512px] rounded-2xl">
      <h3 className="text-body1-16SB">할 일</h3>
      <div className="flex items-center mt-2">
        <button className="mr-2" onClick={toggleTaskEye}>
          <Icon
            Svg={isTaskOpen ? EyesOpen : EyesClosed}
            size={24}
            className="text-gray-600"
          />
        </button>
        <p className="text-body2-14SB text-green">와이어프레임 완료</p>
        <button className="ml-auto">
          <Icon Svg={Edit} size={24} className="text-gray-600" />
        </button>
      </div>

      <div className="flex flex-col gap-1 mt-2 bg-gray-100 rounded-lg px-3 py-2">
        <p className="text-caption-12SB text-gray-600">
          <b className="text-black mr-2">목표시간</b> 00 : 00 : 00
        </p>
        <p className="text-caption-12SB text-gray-600">
          <b className="text-black mr-2">현재 달성률</b> 50%
        </p>
      </div>

      <div className="flex flex-col gap-1 py-5 my-5 border-t border-b border-gray-200">
        <div className="flex">
          <button className="mr-2" onClick={toggleTimeEye}>
            <Icon
              Svg={isTimeOpen ? EyesOpen : EyesClosed}
              size={24}
              className="text-gray-600"
            />
          </button>
          <h3 className="text-body1-16SB">오늘 몰입 누적 시간</h3>
        </div>
        <p className="text-body2-14SB text-red-500">00 : 00 : 00</p>
      </div>
    </div>
  );
}
