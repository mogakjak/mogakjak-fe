"use client";

import Image from "next/image";

interface ForkButtonProps {
  active: boolean;
  onClick?: () => void;
}

export default function ForkButton({ active, onClick }: ForkButtonProps) {
  return (
    <button
      onClick={active ? onClick : undefined}
      disabled={!active}
      aria-disabled={!active}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl border border-gray-200 text-body2-14SB transition-colors duration-200
        ${
          active
            ? "text-white bg-red-500 hover:bg-red-600 cursor-pointer"
            : "text-gray-400 bg-gray-200 cursor-not-allowed pointer-events-none select-none"
        }
      `}
    >
      <Image
        src={active ? "/Icons/forkActive.svg" : "/Icons/forkInActive.svg"}
        alt="포크 아이콘"
        width={20}
        height={20}
      />
      포크로 찌르기
    </button>
  );
}
