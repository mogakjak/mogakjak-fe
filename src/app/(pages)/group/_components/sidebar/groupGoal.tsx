"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "../../../../_components/common/Icons";

import SidebarButton from "./sidebarButton";
import Notification from "/Icons/notification.svg";
import NotiModal from "../../../../_components/group/modal/notiModal";
import { GroupDetail } from "@/app/_types/groups";
import { useUpdateGroupGoal } from "@/app/_hooks/groups/useUpdateGroupGoal";

type GroupGoalProps = {
  data: GroupDetail;
};

export default function GroupGoal({ data }: GroupGoalProps) {
  const [openNoti, setOpenNoti] = useState(false);
  const [goalHour, setGoalHour] = useState(data.groupGoal.goalHours);
  const [goalMin, setGoalMin] = useState(data.groupGoal.goalMinutes);
  const { mutateAsync: updateGoal } = useUpdateGroupGoal(data.groupId);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.slice(0, 2);
    setGoalHour(Number(v));
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.slice(0, 2);
    setGoalMin(Number(v));
  };

  const lastSavedRef = useRef<{ hour: number; minute: number } | null>(null);

  useEffect(() => {
    if (goalHour === 0 && goalMin === 0) return;

    const timer = setTimeout(() => {
      if (goalMin > 59) return;

      const payload = { hour: goalHour, minute: goalMin };

      const last = lastSavedRef.current;
      if (
        last &&
        last.hour === payload.hour &&
        last.minute === payload.minute
      ) {
        return;
      }

      updateGoal(payload)
        .then(() => {
          lastSavedRef.current = payload;
        })
        .catch((err) => {
          console.error("그룹 목표 저장 실패:", err);
        });
    }, 3000);

    return () => clearTimeout(timer);
  }, [goalHour, goalMin, updateGoal]);

  return (
    <>
      <div className="flex flex-col gap-3 bg-white px-8 py-6 rounded-2xl ">
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

            <div className="flex gap-1 items-baseline">
              <input
                type="text"
                value={goalHour}
                onChange={handleHourChange}
                placeholder="0"
                className="
                        w-8
                        text-heading3-24SB
                        text-right
                        text-gray-800
                        placeholder:text-gray-800
                        bg-transparent 
                        border-none 
                        outline-none
                        p-0
                        [appearance:textfield]
                        [&::-webkit-outer-spin-button]:appearance-none
                        [&::-webkit-inner-spin-button]:appearance-none
                      "
              />
              <span className="text-heading3-24SB text-gray-800">h</span>

              <input
                type="text"
                value={goalMin}
                onChange={handleMinChange}
                placeholder="0"
                className="
                            w-3.5
                            text-heading3-24SB
                          text-gray-800
                            placeholder:text-gray-800
                            bg-transparent 
                            border-none 
                            outline-none
                            p-0
                            ml-0.5
                            [appearance:textfield]
                            [&::-webkit-outer-spin-button]:appearance-none
                            [&::-webkit-inner-spin-button]:appearance-none  
                            "
              />
              <span className="text-heading3-24SB text-gray-800">m</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-body2-14R text-gray-600">달성률</p>
            <p className="text-heading3-24SB text-red-500">
              {data.progressRate}%
            </p>
          </div>
        </div>
      </div>

      {openNoti && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenNoti(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <NotiModal
              onClose={() => setOpenNoti(false)}
              groupId={data.groupId}
            />
          </div>
        </div>
      )}
    </>
  );
}
