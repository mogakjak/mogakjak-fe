"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTimer } from "@/app/_contexts/TimerContext";

interface HeaderButtonProps {
  text: string;
  href: string;
}

export default function HeaderButton({ text, href }: HeaderButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === href;
  const { isRunning } = useTimer();

  const handleClick = () => {
    if (isRunning) {
      return; // 타이머 실행 중일 때는 클릭 무시
    }
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isRunning}
      className={
        "w-30 h-10 rounded-3xl text-body1-16M transition-colors border " +
        (isActive
          ? "border-red-500 bg-red-500 text-white"
          : "text-gray-600 border-gray-200 hover:text-red-500 hover:border-red-500") +
        (isRunning ? " opacity-50 cursor-not-allowed" : "")
      }
    >
      {text}
    </button>
  );
}
