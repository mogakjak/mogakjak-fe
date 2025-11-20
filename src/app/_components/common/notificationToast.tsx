"use client";

import { useEffect, useState } from "react";
import Icon from "./Icons";
import NotificationIcon from "/Icons/notification.svg";

type NotificationToastProps = {
  message: string;
  onClose: () => void;
  duration?: number;
};

export default function NotificationToast({
  message,
  onClose,
  duration = 5000,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 애니메이션을 위한 약간의 지연
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // 자동 닫기
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 애니메이션 완료 후 닫기
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`
        fixed top-6 left-1/2 -translate-x-1/2 z-[9999]
        bg-white rounded-2xl shadow-lg
        px-6 py-4 min-w-[320px] max-w-[500px]
        flex items-center gap-3
        transition-all duration-300 ease-in-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
    >
      <div className="flex-shrink-0">
        <Icon Svg={NotificationIcon} size={24} className="text-red-500" />
      </div>
      <div className="flex-1">
        <p className="text-body1-16SB text-gray-800">{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 5L5 15M5 5L15 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

