"use client";

import React from "react";

type MessageBubbleProps = {
  value: string;
  onChange?: (value: string) => void;
  type?: "friend" | "me";
};

export default function MessageBubble({
  value,
  onChange,
  type = "friend",
}: MessageBubbleProps) {
  const isFriend = type === "friend";

  return (
    <div className={`relative flex h-[66px]`}>
      <div className="relative flex p-3 rounded-[20px] bg-gray-100 text-caption-12R">
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="오늘도 파이팅!"
          className={`bg-transparent outline-none w-full text-center resize-none overflow-hidden
            [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] 
            leading-[18px]`}
          rows={2}
        />
        <div
          className={`absolute -bottom-2 ${
            isFriend
              ? "left-5 border-r-[20px] border-r-transparent border-t-[10px] border-t-gray-100"
              : "right-15 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-gray-100"
          }`}
        />
      </div>
    </div>
  );
}
