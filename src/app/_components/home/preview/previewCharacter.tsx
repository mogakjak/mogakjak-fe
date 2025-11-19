"use client";

import Image from "next/image";
import CheerUp from "../../../(pages)/group/_components/field/cheerUp";
import type { Character } from "@/app/_types/mypage";
type PreviewCharacterProps = {
  state: boolean;
  nickname: string;
  character: Character;
};

export default function PreviewCharacter({
  state,
  nickname,
  character,
}: PreviewCharacterProps) {
  return (
    <div className="flex flex-col mb-2">
      <div className="flex justify-between mb-2">
        <p className="text-heading4-20SB ">{nickname} (나)</p>
        {state && <CheerUp />}
      </div>
      <div className="flex flex-col items-center pt-1.5 gap-5">
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
