"use client";

import clsx from "clsx";

export default function WorkTitleField({
  value,
  placeholder = "할 일을 입력하세요. (예: 와이어프레임 만들기)",
  onChange,
  className,
}: {
  value: string;
  placeholder?: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={clsx(
        "h-11 w-full px-4 py-2 bg-gray-100 rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 text-sm leading-tight text-neutral-900 placeholder:text-zinc-500",
        className,
      )}
    />
  );
}
