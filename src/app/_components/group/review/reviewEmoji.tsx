"use client";

import Image from "next/image";
import clsx from "clsx";

type EmojiType = "bad" | "good" | "sogood" | "soso" | "toobad";

interface ReviewEmojiProps {
  type: EmojiType;
  selected?: boolean;
  onClick?: () => void;
}

export default function ReviewEmoji({
  type,
  selected = false,
  onClick,
}: ReviewEmojiProps) {
  const src = `/Icons/emoji/${type}.svg`;

  return (
    <button
      onClick={onClick}
      className={clsx(
        "p-1.5 rounded-full transition-all border duration-150 flex items-center justify-center",
        selected
          ? "border-red-500 "
          : "bg-white border border-gray-200 hover:bg-gray-200"
      )}
    >
      <Image src={src} alt={type} width={36} height={36} />
    </button>
  );
}
