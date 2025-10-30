import Icon from "@/app/_components/common/Icons";
import Character from "./basket/character";

// 아이콘
import Image from "next/image";
import CharacterModal from "./basket/characterModal";
import { useState } from "react";

export default function BoardBasket() {
  const characters = [
    { name: "tomato", locked: false },
    { name: "tomato", locked: false },
    { name: "tomato", locked: false },
    { name: "tomato", locked: false },
    { name: "tomato", locked: false },
    { name: "tomato", locked: false },
    { name: "tomato", locked: true },
    { name: "tomato", locked: true },
    { name: "tomato", locked: true },
    { name: "tomato", locked: true },
    { name: "tomato", locked: true },
    { name: "tomato", locked: true },
  ];
  const [openCharacter, setOpenCharacter] = useState(false);
  const unlockedCount = characters.filter((c) => !c.locked).length;
  const totalCount = characters.length;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center  mb-6">
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
            name={character.name}
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
