"use client";

import { useState } from "react";
import Icon from "../../../../_components/common/Icons";
import Edit from "/Icons/edit.svg";
import { GroupDetail } from "@/app/_types/groups";
import GoalModal from "@/app/_components/group/modal/goalModal";

type GroupGoalProps = {
  data: GroupDetail;
  isHost: boolean;
};

export default function GroupGoal({ data, isHost }: GroupGoalProps) {
  const [openGoalModal, setOpenGoalModal] = useState(false);

  const { goalHours, goalMinutes } = data.groupGoal;

  return (
    <>
      <div className="flex flex-col justify-center items-center h-full bg-white px-8 py-6 rounded-2xl w-full">
        <h3 className="text-heading4-20SB text-black">그룹 목표 시간</h3>

        <div className="relative group flex items-center gap-1 mt-4 mb-4">
          <span className="text-heading2-28SB text-gray-800">
            {goalHours}h
          </span>

          <span className="text-heading2-28SB text-gray-800 ml-1">
            {String(goalMinutes).padStart(2, "0")}m
          </span>

          {isHost && (
            <button className="ml-1" onClick={() => setOpenGoalModal(true)}>
              <Icon Svg={Edit} size={24} className="text-gray-600" />
            </button>
          )}

          {!isHost && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-body2-14R rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              방장이 대표로 관리하고 있어요
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800" />
            </div>
          )}
          
        </div>

        <div className="flex items-center gap-2">
          <p className="text-body1-16R text-gray-600">달성률</p>
          <p className="text-heading2-28SB text-red-500">
            {data.progressRate}%
          </p>
        </div>
      </div>
      

      {openGoalModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenGoalModal(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <GoalModal
              onClose={() => setOpenGoalModal(false)}
              groupId={data.groupId}
              initialData={{
                hour: goalHours,
                minute: goalMinutes,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
