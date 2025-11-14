"use client";

import Image from "next/image";
import CheerUp from "../../group/field/cheerUp";

type PreviewCharacterProps = {
  state: boolean;
};

export default function PreviewCharacter({ state }: PreviewCharacterProps) {
  return (
    <div className="flex flex-col mb-2">
      <div className="flex justify-between mb-2">
        <p className="text-heading4-20SB ">김나은 (나)</p>
        {state && <CheerUp />}
      </div>
      <div className="flex flex-col items-center pt-1.5 gap-5">
        <Image
          src="/character/tomato.svg"
          alt="캐릭터"
          width={135}
          height={135}
        />
        <p className="text-body1-16SB">Lv2.부끄뽀모</p>
      </div>
    </div>
  );
}
