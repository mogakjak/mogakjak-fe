"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import GroupModal from "./groupModal";
import ToggleButton from "./toggleButton";
import Image from "next/image";
import { useUpdateGroupNotifications } from "@/app/_hooks/groups";

interface NotiModalProps {
  onClose: () => void;
  groupId: string;
}

export default function NotiModal({ onClose, groupId }: NotiModalProps) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [hours, setHours] = useState(1);
  const [message, setMessage] = useState("");

  const { mutateAsync: updateNoti } = useUpdateGroupNotifications(groupId);

  const increase = () => {
    if (!isAgreed) return;
    setHours((prev) => Math.min(99, prev + 1));
  };
  const decrease = () => {
    if (!isAgreed) return;
    setHours((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    try {
      await updateNoti({
        isNotificationAgreed: isAgreed,
        notificationCycle: hours,
        notificationMessage: message,
      });

      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <GroupModal onClose={onClose}>
      <div className="flex flex-col px-7 py-4">
        <h2 className="text-heading4-20SB text-center">집중 체크 알림</h2>
        <p className="text-body1-16R text-gray-700 mt-2">
          그룹원들의 집중 유지를 위한 주기적 알림 장치입니다.
        </p>

        <p className="text-body1-16SB mt-7">알림 기능 사용</p>

        <div className="flex gap-3 items-center mt-3 mb-7">
          <ToggleButton
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          />
          <p className="text-body2-14R text-gray-600">
            {isAgreed ? "알림을 받을게요" : "알림을 안 받을래요"}
          </p>
        </div>

        <p className={`text-body1-16SB mt-7 ${!isAgreed && "text-gray-400"}`}>
          알림 주기
        </p>

        <div className="mt-3 mb-7 w-full">
          <div
            className={`
              flex items-center justify-between  px-5 py-1.5 rounded-lg border bg-gray-100 border-gray-200
              ${isAgreed ? "" : "opacity-50"}
            `}
          >
            <div className="flex-1 text-center">
              <span className="text-body1-16SB text-gray-800">{hours}</span>
              <span className="text-body1-16SB text-gray-600 ml-1">시간</span>
            </div>

            <div className="flex flex-col ml-4">
              <button
                type="button"
                onClick={increase}
                disabled={!isAgreed}
                className="w-6 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                <Image
                  src={"/Icons/arrowUp.svg"}
                  alt="화살표 위"
                  width={16}
                  height={16}
                ></Image>
              </button>
              <button
                type="button"
                onClick={decrease}
                disabled={!isAgreed}
                className="w-6 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                <Image
                  src={"/Icons/arrowDown.svg"}
                  alt="화살표 위"
                  width={16}
                  height={16}
                ></Image>
              </button>
            </div>
          </div>
        </div>

        <p className={`text-body1-16SB mt-7 ${!isAgreed && "text-gray-400"}`}>
          알림 메시지
        </p>
        <div
          className={`
            bg-gray-100 px-5 py-3 rounded-lg w-full border border-gray-200 mt-3 mb-7
            ${!isAgreed && "opacity-50"}
          `}
        >
          <input
            type="text"
            disabled={!isAgreed}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-gray-100 border-none outline-none text-body2-14R"
            placeholder="텍스트를 입력해주세요"
          />
        </div>

        <Button className="w-full" leftIcon={null} onClick={handleSubmit}>
          설정 완료
        </Button>
      </div>
    </GroupModal>
  );
}
