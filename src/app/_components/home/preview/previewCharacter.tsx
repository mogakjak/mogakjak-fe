"use client";

import Image from "next/image";
import CheerUp from "../../../(pages)/group/_components/field/cheerUp";
import type { Character } from "@/app/_types/mypage";
type PreviewCharacterProps = {
  state: boolean;
  nickname: string;
  character: Character;
  isHost?: boolean;
  cheerCount?: number;
};

export default function PreviewCharacter({
  state,
  nickname,
  character,
  isHost = false,
  cheerCount = 0,
}: PreviewCharacterProps) {
  return (
    <div className="flex flex-col mb-1">
      <div className="flex justify-between mb-1">
        <div className="flex items-center gap-1">
          <p className="text-heading4-20SB max-w-[150px] truncate">
            {nickname}
          </p>
          <span className="text-heading4-20SB">(나)</span>
          {isHost && (
            <Image
              src="/Icons/king.svg"
              alt="방장"
              width={20}
              height={20}
            />
          )}
        </div>
        {state && <CheerUp cheerCount={cheerCount} />}
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <div className="w-[135px] h-[135px] relative shrink-0">
          <Image
            src={character.mainCharacterImage}
            alt="캐릭터"
            width={135}
            height={135}
            priority
            loading="eager"
            fetchPriority="high"
            style={{ aspectRatio: "1 / 1" }}
            className="object-contain"
          />
        </div>
        <p className="text-body1-16SB">
          Lv{character.level}.{character.name}
        </p>
      </div>
    </div>
  );
}
