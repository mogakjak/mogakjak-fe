"use client";

import { Button } from "@/components/button";
import type { TimerCompletionNotification } from "@/app/_hooks/_websocket/notifications/useTimerCompletionNotification";

type TimerCompletionModalProps = {
  notification: TimerCompletionNotification;
  onClose: () => void;
};

export default function TimerCompletionModal({
  notification,
  onClose,
}: TimerCompletionModalProps) {
  const title = notification.todoTitle
    ? `"${notification.todoTitle}" 타이머 완료!`
    : "타이머 완료!";

  const message = notification.message || "설정한 시간이 완료되었습니다.";

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
      <div className="flex flex-col w-[340px] bg-white rounded-xl shadow-lg">
        <div className="flex flex-col p-7 pt-8 text-center">
          <h2 className="text-heading3-24SB text-gray-800 mb-2">{title}</h2>
          <p className="text-body1-16R text-gray-600">{message}</p>
        </div>

        <div className="px-7 pb-7">
          <Button onClick={onClose} leftIcon={null} className="w-full">
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
