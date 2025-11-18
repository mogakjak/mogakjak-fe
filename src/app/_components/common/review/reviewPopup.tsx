"use client";

import { useMemo, useState } from "react";
import ReviewEmoji from "./reviewEmoji";
import ReviewTag from "./reviewTag";
import { useCreateFeedback, useFeedbackTags } from "@/app/_hooks/feedback";
import { FeedbackTagType } from "@/app/_types/feedback";

type EmojiType = "toobad" | "bad" | "soso" | "good" | "sogood";

interface ReviewBlock {
  types: EmojiType[];
  question: string;
}

interface ReviewPopupProps {
  groupName: string;
  sessionId: string;
  onClose: () => void;
  onExitGroup: () => void;
}

const REVIEW_OPTIONS: ReadonlyArray<ReviewBlock> = [
  {
    types: ["toobad", "bad"],
    question: "어떤 점이 아쉬우셨나요?",
  },
  {
    types: ["soso"],
    question: "어떤 점을 더 개선하면 좋을까요?",
  },
  {
    types: ["good", "sogood"],
    question: "어떤 점이 좋았나요?",
  },
];

// 타입 매핑
const emojiToFeedbackType = (emoji: EmojiType): FeedbackTagType => {
  if (emoji === "toobad" || emoji === "bad") return "NEGATIVE";
  if (emoji === "soso") return "NEUTRAL";
  return "POSITIVE"; // good, sogood
};

// 점수 매핑
const emojiToScore = (emoji: EmojiType): number => {
  switch (emoji) {
    case "toobad":
      return 1;
    case "bad":
      return 2;
    case "soso":
      return 3;
    case "good":
      return 4;
    case "sogood":
      return 5;
    default:
      return 3;
  }
};

export default function ReviewPopup({
  groupName,
  sessionId,
  onClose,
  onExitGroup,
}: ReviewPopupProps) {
  const emojis: EmojiType[] = ["toobad", "bad", "soso", "good", "sogood"];

  const [selectedEmoji, setSelectedEmoji] = useState<EmojiType | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [etcText, setEtcText] = useState("");

  const block = useMemo(() => {
    if (!selectedEmoji) return null;
    return REVIEW_OPTIONS.find((b) => b.types.includes(selectedEmoji)) ?? null;
  }, [selectedEmoji]);

  const feedbackType: FeedbackTagType | undefined = useMemo(() => {
    return selectedEmoji ? emojiToFeedbackType(selectedEmoji) : undefined;
  }, [selectedEmoji]);

  const { data: feedbackTags = [], isPending } = useFeedbackTags(feedbackType);
  const { mutateAsync: createFeedback, isPending: isSubmitting } =
    useCreateFeedback();

  const handleEmojiClick = (e: EmojiType) => {
    if (selectedEmoji === e) {
      setSelectedEmoji(null);
      setSelectedTags([]);
    } else {
      setSelectedEmoji(e);
      setSelectedTags([]);
    }
  };

  const toggleTag = (code: string) => {
    setSelectedTags((prev) =>
      prev.includes(code) ? prev.filter((t) => t !== code) : [...prev, code]
    );
  };

  const handleSubmit = async () => {
    if (!selectedEmoji) return;

    try {
      const score = emojiToScore(selectedEmoji);

      await createFeedback({
        sessionId,
        score,
        tagCodes: selectedTags,
        content: etcText.trim(),
      });

      onClose();
      onExitGroup();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col w-[340px]">
      <div className="flex flex-col p-7 pt-8 bg-white rounded-t-xl shadow-md text-center">
        <h2 className="text-body1-16SB">{groupName}</h2>
        <p className="text-body2-14R text-gray-600 mt-2 pb-4">
          언제든 다시 참여하실 수 있어요
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

              <div className="flex flex-wrap justify-center gap-1 mt-3 min-h-[40px] w-full">
                {isPending && (
                  <div className="flex flex-wrap justify-center gap-2 w-full">
                    <div className="h-8 px-8 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                )}

                {!isPending &&
                  feedbackTags.map((tag) => (
                    <ReviewTag
                      key={tag.code}
                      text={tag.displayName}
                      selected={selectedTags.includes(tag.code)}
                      onClick={() => toggleTag(tag.code)}
                    />
                  ))}
              </div>

              <textarea
                name="기타 의견"
                id="etc"
                className="w-full h-[112px] px-5 py-3 mt-3 text-caption-12R text-black border border-gray-200 rounded-lg resize-none outline-none"
                placeholder="모각작이 더 좋은 서비스가 될 수 있도록 의견을 공유해 주세요"
                value={etcText}
                onChange={(e) => setEtcText(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-200 text-gray-600 rounded-bl-xl"
        >
          취소
        </button>
        <button
          className="w-full py-3 bg-red-500 text-white rounded-br-xl disabled:bg-red-300"
          onClick={handleSubmit}
          disabled={!selectedEmoji || isSubmitting}
        >
          {isSubmitting ? "제출 중..." : "종료하고 나가기"}
        </button>
      </div>
    </div>
  );
}
