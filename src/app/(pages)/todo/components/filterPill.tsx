"use client";

import clsx from "clsx";
import Image from "next/image";

type Props = {
  selected?: boolean;
  onClick?: () => void;
  icon: string;
  label: string;
};

export default function FilterPill({ selected, onClick, icon, label }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        "h-9 min-w-[100px] rounded-[80px] px-4 inline-flex items-center justify-center gap-2 transition-colors",
        selected
          ? "bg-red-50 outline-1 outline-red-200"
          : "bg-gray-100 outline-1 outline-gray-200 hover:bg-gray-200",
      )}
    >
      <Image src={icon} alt="" width={20} height={20} className="w-5 h-5" />
      <span
        className={clsx(
          "text-body2-14SB",
          selected ? "text-red-500" : "text-gray-700",
        )}
      >
        {label}
      </span>
    </button>
  );
}
