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
      className={clsx(
        "flex-1 h-9 rounded-[80px] px-4 py-2.5 inline-flex items-center justify-center gap-2",
        selected
          ? "bg-neutral-50 outline-[1.5px] outline-red-500"
          : "bg-gray-100 outline-1 outline-gray-200",
      )}
    >
      <Image src={icon} alt="" width={24} height={24} className="w-6 h-6" />
      <span
        className={clsx(
          "text-sm leading-tight",
          selected ? "text-red-500 font-semibold" : "text-neutral-700",
        )}
      >
        {label}
      </span>
    </button>
  );
}
