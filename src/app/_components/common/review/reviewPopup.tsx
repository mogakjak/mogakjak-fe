"use client";

import { useMemo, useState } from "react";
import ReviewEmoji from "./reviewEmoji";
import ReviewTag from "./reviewTag";

type EmojiType = "toobad" | "bad" | "soso" | "good" | "sogood";

interface ReviewBlock {
  types: readonly EmojiType[];
  question: string;
  options: readonly string[];
}

const REVIEW_OPTIONS = [
  {
    types: ["toobad", "bad"],
    question: "어떤 점이 아쉬우셨나요?",
    options: [
      "타이머/기록 기능에 오류가 있었어요",
      "UI가 복잡하거나 불편했어요",
      "집중을 방해하는 알림/요소가 있었어요",
      "원하는 기능이 없었어요",
    ],
  },
  {
    types: ["soso"],
    question: "어떤 점을 더 개선하면 좋을까요?",
    options: [
      "작업 통계를 더 자세히 보고 싶어요",
      "목표 설정 기능이 더 강력했으면 좋겠어요",
      "디자인/사용성이 개선되면 좋겠어요",
      "새로운 기능이 추가되면 좋겠어요",
    ],
  },
  {
    types: ["good", "sogood"],
    question: "어떤 점이 좋았나요?",
    options: [
      "스스로 시간을 관리하는 데 도움이 됐어요",
      "타이머와 목표 관리가 유용했어요",
      "디자인이 깔끔하고 직관적이에요",
      "방해 없이 몰입할 수 있었어요",
    ],
  },
] as const satisfies readonly ReviewBlock[];

export default function ReviewPopup() {
  const emojis: EmojiType[] = ["toobad", "bad", "soso", "good", "sogood"];

  const [selectedEmoji, setSelectedEmoji] = useState<EmojiType | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const block = useMemo(() => {
    if (!selectedEmoji) return null;
    return REVIEW_OPTIONS.find((b) => b.types.includes(selectedEmoji)) ?? null;
  }, [selectedEmoji]);

  const handleEmojiClick = (e: EmojiType) => {
    if (selectedEmoji === e) {
      setSelectedEmoji(null);
      setSelectedTags([]);
    } else {
      setSelectedEmoji(e);
      setSelectedTags([]);
    }
  };

  const toggleTag = (text: string) => {
    setSelectedTags((prev) =>
      prev.includes(text) ? prev.filter((t) => t !== text) : [...prev, text]
    );
  };

  return (
    <div className="flex flex-col w-[340px]">
      <div className="flex flex-col p-7 pt-8 bg-white rounded-t-xl shadow-md text-center">
        <h2 className="text-body1-16SB">팀이름</h2>
        <p className="text-body2-14R text-gray-600 mt-2 pb-4">
          부연설명 팀이름 부연설명
        </p>

        <p className="text-body2-14SB text-gray-800 pt-4 border-t border-gray-200">
          나가기 전, 잠시 시간을 내어 <br /> 이번 몰입 경험에 대해 공유해
          주시겠어요?
        </p>

        <div className="flex gap-1 justify-center mt-3">
          {emojis.map((e) => (
            <ReviewEmoji
              key={e}
              type={e}
              selected={selectedEmoji === e}
              onClick={() => handleEmojiClick(e)}
            />
          ))}
        </div>

        <div className="mt-4">
          {block && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-caption-12R text-gray-600">{block.question}</p>
              <div className="flex flex-wrap justify-center gap-1 mt-3">
                {block.options.map((opt) => (
                  <ReviewTag
                    key={opt}
                    text={opt}
                    selected={selectedTags.includes(opt)}
                    onClick={() => toggleTag(opt)}
                  />
                ))}
              </div>

              <textarea
                name="기타 의견"
                id="etc"
                className="w-full h-[112px] px-5 py-3 mt-3 text-caption-12R text-black border border-gray-200 rounded-lg resize-none outline-none"
                placeholder="모각작이 더 좋은 서비스가 될 수 있도록 의견을 공유해 주세요"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        <button className="w-full py-3 bg-gray-200 text-gray-600 rounded-bl-xl">
          취소
        </button>
        <button
          className="w-full py-3 bg-red-500 text-white rounded-br-xl disabled:opacity-50"
          disabled={!selectedEmoji}
          onClick={() => {
            console.log("emoji:", selectedEmoji);
            console.log("tags:", selectedTags);
          }}
        >
          종료하고 나가기
        </button>
      </div>
    </div>
  );
}
