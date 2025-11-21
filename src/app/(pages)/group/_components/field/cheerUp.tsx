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
      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
    >
      <p className="text-body2-14SB text-red-600">{cheerCount}</p>
      <Image src="/Icons/cheerup.svg" alt="응원" width={24} height={24}></Image>
    </button>
  );
}
