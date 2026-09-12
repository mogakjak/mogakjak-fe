"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import GroupModal from "./groupModal";
import Image from "next/image";
import { useUpdateGroupNotifications } from "@/app/_hooks/groups/useUpdateGroupNotifications";

interface NotiModalProps {
  onClose: () => void;
  groupId: string;
  initialData: {
    hours: number;
  };
}

export default function NotiModal({
  onClose,
  groupId,
  initialData,
}: NotiModalProps) {
  const [hours, setHours] = useState(initialData.hours);

  const { mutateAsync: updateNoti, isPending: isUpdating } =
    useUpdateGroupNotifications(groupId);

  const handleSubmit = async () => {
    try {
      await updateNoti({
        notificationCycle: hours,
      });
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const increase = () => {
    setHours((prev) => Math.min(99, prev + 1));
  };

  const decrease = () => {
    setHours((prev) => Math.max(1, prev - 1));
  };

  return (
    <GroupModal onClose={onClose}>
      <div className="flex flex-col px-7 py-4">
        <h2 className="text-heading4-20SB text-center">집중 체크 주기 설정</h2>
        <p className="text-body1-16R text-gray-700 mt-2 text-center">
          그룹원에게 집중 체크 알림을 보낼 주기를 설정합니다.
        </p>

        <p className="text-body1-16SB mt-7">알림 주기</p>

        <div className="mt-3 mb-7 w-full">
          <div
            className="flex items-center justify-between px-5 py-1.5 rounded-lg border bg-gray-100 border-gray-200"
          >
            <div className="flex-1 text-center">
              <span className="text-body1-16SB text-gray-800">{hours}</span>
              <span className="text-body1-16SB text-gray-600 ml-1">시간</span>
            </div>

            <div className="flex flex-col ml-4">
              <button
                onClick={increase}
                className="w-6 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                <Image
                  src="/Icons/arrowUp.svg"
                  alt="up"
                  width={16}
                  height={16}
                />
              </button>
              <button
                onClick={decrease}
                className="w-6 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                <Image
                  src="/Icons/arrowDown.svg"
                  alt="down"
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </div>
        </div>

        <Button
          className="w-50 justify-center mx-auto"
          onClick={handleSubmit}
          disabled={isUpdating}
        >
          설정 완료
        </Button>
      </div>
    </GroupModal>
  );
}
