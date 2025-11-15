"use client";

import React from "react";
import clsx from "clsx";

interface TabButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function TabButton({
  label,
  active = false,
  onClick,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "text-heading4-20SB relative w-[100px] min-w-[100px] pb-2 text-center transition-colors",
        active ? "text-red-600" : "text-gray-400"
      )}
    >
      {label}
      <span
        className={clsx(
          "absolute left-0 bottom-0 h-[2px] w-full transition-all",
          active ? "bg-red-600" : "bg-gray-200"
        )}
      />
    </button>
  );
}
