"use client";

import React from "react";
import clsx from "clsx";

type Accent = "green" | "orange";

interface DataCardProps {
  title: React.ReactNode; // 문자열이 아닌 ReactNode로 변경
  value: string | number;
  accent?: Accent;
  className?: string;
}

const accentMap: Record<Accent, string> = {
  green: "text-green",
  orange: "text-red-500",
};

export default function DataCard({
  title,
  value,
  accent = "green",
  className,
}: DataCardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-gray-100",
        "px-6 py-5 flex flex-col items-center justify-center text-center",
        className
      )}
    >
      <div className="text-body1-16R text-gray-600 ">{title}</div>
      <div
        className={clsx(
          "mt-2 text-heading1-32B tracking-tight",
          accentMap[accent]
        )}
      >
        {value}
      </div>
    </div>
  );
}
