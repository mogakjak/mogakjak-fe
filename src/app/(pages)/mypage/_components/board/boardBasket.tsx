"use client";
import { useMemo, useState } from "react";
import Character from "./basket/character";

// 아이콘
import Image from "next/image";
import CharacterModal from "./basket/characterModal";
import { rows } from "@/app/_utils/getCharacterByHours";
import { CharacterCard } from "@/app/_types/mypage";
import { sendGAEvent } from "@next/third-parties/google";

const getDescriptionByLevel = (level: number): string => {
  const character = rows.find((c) => c.level === level);
  return character?.description || "";
};

export default function BoardBasket({
  ownedCharacters = [],
}: {
  ownedCharacters: CharacterCard[];
}) {
  const [openCharacter, setOpenCharacter] = useState(false);

  // ownedCharacters를 level로 매핑하여 빠른 조회 가능하게
  const ownedCharactersMap = useMemo(() => {
    const map = new Map<number, CharacterCard>();
    ownedCharacters.forEach((char) => {
      map.set(char.level, char);
    });
    return map;
  }, [ownedCharacters]);

  return (
    <section className="w-full h-[438px] p-6 rounded-[20px] bg-white flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h2 className="text-heading4-20SB text-black">
          내 과일 바구니 ({ownedCharacters.length}/12)
        </h2>
        <button
          className="h-10 flex items-center gap-2.5 text-body1-16M text-gray-400 px-7 border border-gray-200 rounded-[22px]"
          onClick={() => {
            sendGAEvent("event", "fruit_dex_open");
            setOpenCharacter(true);
          }}
        >
          <Image
            src="/Icons/info.svg"
            alt={"정보"}
            width={24}
            height={24}
          ></Image>
          과일 도감
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-3 grid grid-cols-4 gap-x-[11px] gap-y-5 content-start">
        {rows.map((characterInfo) => {
          const ownedCharacter = ownedCharactersMap.get(characterInfo.level);
          const isLocked = !ownedCharacter;

          return (
            <Character
              key={`character-level-${characterInfo.level}`}
              hours={characterInfo.hours}
              attendanceDays={characterInfo.attendanceDays}
              level={characterInfo.level}
              name={ownedCharacter?.name || characterInfo.name}
              description={getDescriptionByLevel(characterInfo.level)}
              imageUrl={
                ownedCharacter?.imageUrl ||
                `/character/level${characterInfo.level}.svg`
              }
              locked={isLocked}
            />
          );
        })}
      </div>

      {openCharacter && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenCharacter(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <CharacterModal onClose={() => setOpenCharacter(false)} />
          </div>
        </div>
      )}
    </section>
  );
}
