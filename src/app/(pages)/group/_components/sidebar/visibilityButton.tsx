"use client";

import clsx from "clsx";

type VisibilityToggleProps = {
  isTaskOpen: boolean;
  setIsTaskOpen: (v: boolean) => void;
  className?: string;
};

export default function VisibilityToggle({
  isTaskOpen,
  setIsTaskOpen,
  className,
}: VisibilityToggleProps) {
  return (
    <div className={clsx("flex w-full mt-1.5", className)}>
      <button
        onClick={() => setIsTaskOpen(true)}
        className={clsx(
          "flex-1 py-1 rounded-sm transition-colors text-caption-12SB",
          isTaskOpen
            ? "border border-red-300 text-red-400"
            : "bg-gray-300 text-gray-500"
        )}
      >
        공개
      </button>

      <button
        onClick={() => setIsTaskOpen(false)}
        className={clsx(
          "flex-1 text-gray-500 py-1 rounded-sm  transition-colors text-caption-12SB",
          !isTaskOpen
            ? "border border-red-300 text-red-400"
            : "bg-gray-200 text-gray-500"
        )}
      >
        비공개
      </button>
    </div>
  );
}
