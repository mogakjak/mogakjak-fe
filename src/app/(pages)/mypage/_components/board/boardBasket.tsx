"use client";
import { useMemo, useState } from "react";
import Character from "./basket/character";

// 아이콘
import Image from "next/image";
import CharacterModal from "./basket/characterModal";
import { rows } from "@/app/_utils/getCharacterByHours";
import { CharacterCard } from "@/app/_types/mypage";

export default function BoardBasket({
  currentLevel = 0,
  ownedCharacters = [],
}: {
  currentLevel: number;
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
    <div className="w-full h-full min-h-0 flex flex-col">
      <div className="flex justify-between items-center  mb-3.5">
        <h2 className="text-heading4-20SB text-black">
          내 과일 바구니 ({ownedCharacters.length}/12)
        </h2>
        <button
          className="flex items-center gap-2.5 text-body1-16M text-gray-400 px-7 py-2 border border-gray-200 rounded-[22px]"
          onClick={() => setOpenCharacter(true)}
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

      <div className="grid grid-cols-4 gap-4 items-stretch h-full  auto-rows-fr">
        {rows.map((characterInfo) => {
          const ownedCharacter = ownedCharactersMap.get(characterInfo.level);
          const isLocked = characterInfo.level > currentLevel;

          return (
            <Character
              key={`character-level-${characterInfo.level}`}
              hours={characterInfo.hours}
              level={characterInfo.level}
              name={ownedCharacter?.name || characterInfo.name}
              description={characterInfo.description}
              imageUrl={ownedCharacter?.imageUrl}
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
    </div>
  );
}
