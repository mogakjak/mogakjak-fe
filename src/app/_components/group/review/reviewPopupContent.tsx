"use client";

import ReviewEmoji from "./reviewEmoji";
import ReviewTag from "./reviewTag";
import type { EmojiType } from "@/app/_hooks/characters/useReviewPopup";
import type { FeedbackTag } from "@/app/_types/feedback";

interface ReviewBlock {
    question: string;
}

interface ReviewPopupContentProps {
    groupName: string;
    emojis: EmojiType[];
    selectedEmoji: EmojiType | null;
    block: ReviewBlock | null;
    feedbackTags: FeedbackTag[];
    selectedTags: string[];
    isPendingTags: boolean;
    etcText: string;
    isSubmitting: boolean;

    onClose: () => void;
    onEmojiClick: (emoji: EmojiType) => void;
    onToggleTag: (code: string) => void;
    onChangeEtc: (value: string) => void;
    onSubmit: () => void;
}

export function ReviewPopupContent({
    groupName,
    emojis,
    selectedEmoji,
    block,
    feedbackTags,
    selectedTags,
    isPendingTags,
    etcText,
    isSubmitting,
    onClose,
    onEmojiClick,
    onToggleTag,
    onChangeEtc,
    onSubmit,
}: ReviewPopupContentProps) {
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
                            onClick={() => onEmojiClick(e)}
                        />
                    ))}
                </div>

                <div className="mt-4">
                    {block && (
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-caption-12R text-gray-600">
                                {block.question}
                            </p>

                            <div className="flex flex-wrap justify-center gap-1 mt-3 min-h-[40px] w-full">
                                {isPendingTags && (
                                    <div className="flex flex-wrap justify-center gap-2 w-full">
                                        <div className="h-8 px-8 rounded-full bg-gray-200 animate-pulse" />
                                    </div>
                                )}

                                {!isPendingTags &&
                                    feedbackTags.map((tag) => (
                                        <ReviewTag
                                            key={tag.code}
                                            text={tag.displayName}
                                            selected={selectedTags.includes(tag.code)}
                                            onClick={() => onToggleTag(tag.code)}
                                        />
                                    ))}
                            </div>

                            <textarea
                                name="기타 의견"
                                id="etc"
                                className="w-full h-[112px] px-5 py-3 mt-3 text-caption-12R text-black border border-gray-200 rounded-lg resize-none outline-none"
                                placeholder="모각작이 더 좋은 서비스가 될 수 있도록 의견을 공유해 주세요"
                                value={etcText}
                                onChange={(e) => onChangeEtc(e.target.value)}
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
                    onClick={onSubmit}
                    disabled={isSubmitting}
                >
                    종료하고 나가기
                </button>
            </div>
        </div>
    );
}