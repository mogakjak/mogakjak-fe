"use client";

import Image from "next/image";
import CheerUp from "../../../(pages)/group/_components/field/cheerUp";
import type { Character } from "@/app/_types/mypage";
type PreviewCharacterProps = {
  state: boolean;
  nickname: string;
  character: Character;
  cheerCount?: number;
};

export default function PreviewCharacter({
  state,
  nickname,
  character,
  cheerCount = 0,
}: PreviewCharacterProps) {
  return (
    <div className="flex flex-col mb-1">
      <div className="flex justify-between mb-1">
        <div className="flex items-center">
          <p className="text-heading4-20SB max-w-[150px] truncate">
            {nickname}
          </p>
          <span className="text-heading4-20SB">(나)</span>
        </div>
        {state && <CheerUp cheerCount={cheerCount} />}
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Image
          src={character.mainCharacterImage}
          alt="캐릭터"
          width={135}
          height={135}
        />
        <p className="text-body1-16SB">
          Lv{character.level}.{character.name}
        </p>
      </div>
    </div>
  );
}
