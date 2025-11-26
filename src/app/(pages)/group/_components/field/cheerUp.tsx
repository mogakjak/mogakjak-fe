"use client";

import Image from "next/image";

interface CheerUpProps {
  cheerCount?: number;
  onClick?: () => void;
}

export default function CheerUp({ cheerCount = 0, onClick }: CheerUpProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`응원하기 (현재 ${cheerCount}개)`}
      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
    >
      <p className="text-body2-14SB text-red-600">{cheerCount}</p>
      <div className="w-6 h-6 relative shrink-0">
        <Image
          src="/Icons/cheerup.svg"
          alt="응원"
          width={24}
          height={24}
          style={{ aspectRatio: "1 / 1" }}
          className="object-contain"
        />
      </div>
    </button>
  );
}
