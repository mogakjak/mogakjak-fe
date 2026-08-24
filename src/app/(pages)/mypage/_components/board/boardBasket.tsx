"use client";
import { useMemo, useState } from "react";
import Character from "./basket/character";

// 아이콘
import Image from "next/image";
import CharacterModal from "./basket/characterModal";
import { CharacterBasket, CharacterCard } from "@/app/_types/mypage";
import { sendGAEvent } from "@next/third-parties/google";

const formatFocusTime = (seconds: number | null | undefined) => {
  if (seconds == null) return "-";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`;
};

const getRequirementLabel = (character: CharacterCard) => {
  if (character.unlockCondition) return character.unlockCondition;
  return `출석 ${character.requiredAttendanceDays}일 · 몰입 ${formatFocusTime(character.requiredFocusTimeInSeconds)}`;
};

export default function BoardBasket({
  basket,
}: {
  basket: CharacterBasket;
}) {
  const [openCharacter, setOpenCharacter] = useState(false);

  const characters = useMemo(() => {
    const byLevel = new Map<number, CharacterCard>();
    [...basket.lockedCharacters, ...basket.ownedCharacters].forEach((character) => {
      byLevel.set(character.level, character);
    });
    return [...byLevel.values()].sort((a, b) => a.level - b.level);
  }, [basket.lockedCharacters, basket.ownedCharacters]);

  const ownedLevels = useMemo(
    () => new Set(basket.ownedCharacters.map((character) => character.level)),
    [basket.ownedCharacters],
  );
  const progress = basket.growthProgress;

  return (
    <div className="w-full h-full min-h-0 flex flex-col">
      <div className="flex justify-between items-center  mb-3.5">
        <h2 className="text-heading4-20SB text-black">
          내 과일 바구니 ({basket.collectedCharacterCount}/{characters.length || 12})
        </h2>
        <button
          className="flex items-center gap-2.5 text-body1-16M text-gray-400 px-7 py-2 border border-gray-200 rounded-[22px]"
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

      <p className="text-caption-12R text-gray-500 mb-3">
        현재 Lv.{progress.currentLevel} · 출석 {progress.currentAttendanceDays}일 · 몰입 {formatFocusTime(progress.currentFocusTimeInSeconds)}
        {!progress.maxLevelReached && progress.nextLevel != null
          ? ` · 다음 Lv.${progress.nextLevel}까지 출석 ${progress.remainingAttendanceDays ?? 0}일 / 몰입 ${formatFocusTime(progress.remainingFocusTimeInSeconds)}`
          : " · 최고 레벨 달성"}
      </p>

      <div className="grid grid-cols-4 gap-4 items-stretch min-h-[420px] auto-rows-fr">
        {characters.map((character) => {
          const isLocked = !ownedLevels.has(character.level);

          return (
            <Character
              key={`character-level-${character.level}`}
              level={character.level}
              name={character.name}
              description={getRequirementLabel(character)}
              imageUrl={character.imageUrl || `/character/level${character.level}.svg`}
              locked={isLocked}
              unlockCondition={getRequirementLabel(character)}
              attendanceProgressRate={character.attendanceProgressRate}
              focusTimeProgressRate={character.focusTimeProgressRate}
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
            <CharacterModal
              characters={characters}
              ownedLevels={ownedLevels}
              onClose={() => setOpenCharacter(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
