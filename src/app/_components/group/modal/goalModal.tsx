"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import GroupModal from "./groupModal";
import { useUpdateGroupGoal } from "@/app/_hooks/groups/useUpdateGroupGoal";

interface GoalModalProps {
  onClose: () => void;
  groupId: string;
  initialData: {
    hour: number;
    minute: number;
  };
}

export default function GoalModal({
  onClose,
  groupId,
  initialData,
}: GoalModalProps) {
  const [hour, setHour] = useState<string | number>(initialData.hour);
  const [minute, setMinute] = useState<string | number>(
    String(initialData.minute).padStart(2, "0"),
  );

  const { mutateAsync: updateGoal, isPending } = useUpdateGroupGoal(groupId);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.slice(0, 2);
    setHour(v);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.slice(0, 2);
    setMinute(v);
  };

  const handleSubmit = async () => {
    try {
      await updateGoal({
        hour: Number(hour) || 0,
        minute: Number(minute) || 0,
      });
      onClose();
    } catch (e) {
      console.error("그룹 목표 저장 실패:", e);
    }
  };

  return (
    <GroupModal onClose={onClose}>
      <div className="flex flex-col px-7 py-4 w-[336px] items-center">
        <h2 className="text-heading4-20SB">그룹 공동 목표</h2>
        <p className="text-body1-16R text-gray-700 mt-2 text-center">
          그룹원들이 다같이 달성할 일일 목표 시간을 설정해주세요!
        </p>

        <div className="flex justify-center items-center my-7 text-gray-800 text-heading4-20SB bg-gray-100 rounded-xl w-full px-[40px] py-5">
          <input
            type="text"
            value={hour}
            onChange={handleHourChange}
            placeholder="0"
            className="w-[30px] border-none outline-none text-right bg-transparent text-gray-800 text-heading4-20SB placeholder:text-gray-400"
          />
          <span className="mx-1">h</span>
          <input
            type="text"
            value={minute}
            onChange={handleMinChange}
            placeholder="00"
            className="w-[30px] border-none outline-none text-right bg-transparent text-gray-800 text-heading4-20SB placeholder:text-gray-400"
          />
          <span className="ml-1">m</span>
        </div>

        <Button
          className="w-[200px]"
          leftIcon={null}
          onClick={handleSubmit}
          disabled={isPending}
        >
          설정 완료
        </Button>
      </div>
    </GroupModal>
  );
}
