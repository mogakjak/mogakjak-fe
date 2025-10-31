"use client";
import { useMemo, useState } from "react";
import Character from "./basket/character";

// 아이콘
import Image from "next/image";
import CharacterModal from "./basket/characterModal";
import { rows } from "@/app/_utils/getCharacterByHours";

export default function BoardBasket({
  totalHours = 0,
}: {
  totalHours?: number;
}) {
  const characters = useMemo(() => {
    return rows.map((r) => ({
      level: r.level,
      name: r.name,
      hours: r.hours,
      description: r.description,
      locked: r.level === 1 ? false : totalHours < r.hours, // Lv1은 항상 언락
    }));
  }, [totalHours]);

  const [openCharacter, setOpenCharacter] = useState(false);
  const unlockedCount = characters.filter((c) => !c.locked).length;
  const totalCount = characters.length;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center  mb-6.5">
        <h2 className="text-heading4-20SB text-black">
          내 채소 바구니 ({unlockedCount}/{totalCount})
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
          채소 도감
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {characters.map((character, index) => (
          <Character
            key={`${character.name}-${index}`}
            hours={character.hours}
            level={character.level}
            name={character.name}
            description={character.description}
            locked={character.locked}
          />
        ))}
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
