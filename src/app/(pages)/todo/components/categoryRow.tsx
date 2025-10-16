"use client";

import clsx from "clsx";
import Image from "next/image";

type Props = {
  id: string;
  label: string;
  colorToken: string;
  selected?: boolean;
  onSelect?: () => void;
  showHandle?: boolean;
};

export default function CategoryRow({
  label,
  colorToken,
  selected,
  onSelect,
  showHandle = false,
}: Props) {
  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={onSelect}
        className={clsx(
          "w-64 h-11 rounded-lg inline-flex items-stretch overflow-hidden text-left transition-all",
          "outline outline-offset-[-1px]",
          selected
            ? "outline-[1.5px] outline-red-500"
            : "outline-1 outline-gray-200",
        )}
      >
        <div className={clsx("w-3 h-full", `bg-${colorToken}`)} />
        <div className="flex-1 bg-gray-100 px-4 py-2.5 inline-flex items-center">
          <span
            className={clsx(
              "text-base leading-snug",
              selected ? "text-neutral-900 font-semibold" : "text-neutral-700",
            )}
          >
            {label}
          </span>
        </div>
      </button>
      {showHandle ? (
        <Image
          src="/icons/drag.svg"
          alt="drag handle"
          width={24}
          height={24}
          className="w-6 h-6 shrink-0"
        />
      ) : (
        <div className="w-7 h-6 shrink-0" /> 
      )}
    </div>
  );
}
