"use client";

import Image from "next/image";
import { useProfile } from "@/app/_hooks/mypage/useProfile";

export default function HomeProfileCard() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) {
    return (
      <div className="w-full h-[300px] shrink-0 bg-white rounded-[20px] px-7 py-6 animate-pulse">
        <div className="h-7 w-28 bg-gray-200 rounded" />
        <div className="mx-auto mt-6 size-[135px] rounded-full bg-gray-100" />
        <div className="mx-auto mt-4 h-5 w-20 bg-gray-200 rounded" />
      </div>
    );
  }

  const { nickname, character } = profile;

  return (
    <div className="w-full h-[300px] shrink-0 bg-white rounded-[20px] px-7 py-6 flex flex-col">
      <div className="flex items-center gap-1">
        <p className="text-heading4-20SB text-black max-w-[200px] truncate">
          {nickname}
        </p>
        <span className="text-heading4-20SB text-black">(나)</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <Image
          src={character.mainCharacterImage}
          alt={character.name}
          width={135}
          height={135}
          priority
          className="object-contain aspect-square"
        />
        <p className="text-body1-16SB text-gray-800">{character.name}</p>
      </div>
    </div>
  );
}
