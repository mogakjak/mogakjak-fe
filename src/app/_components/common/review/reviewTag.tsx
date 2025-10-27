"use client";

import clsx from "clsx";

interface ReviewTagProps {
  text: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function ReviewTag({
  text,
  selected = false,
  onClick,
}: ReviewTagProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "text-caption-12R text-gray-600 px-3 py-1 rounded-[80px] border inline-block transition-colors duration-150",
        selected
          ? "text-red-500 bg-white border-red-500"
          : "bg-gray-100  border-gray-200 hover:bg-gray-200 hover:border-gray-200"
      )}
    >
      <p className="text-body2-14R">{text}</p>
    </button>
  );
}
