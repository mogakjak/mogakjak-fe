"use client";

import { useMemo, useState } from "react";
import { useCreateFeedback } from "@/app/_hooks/feedback/useCreateFeedback";
import { useFeedbackTags } from "@/app/_hooks/feedback/useFeedbackTags";
import { FeedbackTagType } from "@/app/_types/feedback";
import { useExitGroupSession } from "@/app/_hooks/groups/useExitGroupSession";
import { getTotalStudyTime } from "@/app/api/mypage/api";
import { useCheckAward } from "@/app/_hooks/characters/useCheckAward";
import type { AwardCharacterState } from "@/app/_types/characters";

export type EmojiType = "toobad" | "bad" | "soso" | "good" | "sogood";

interface ReviewBlock {
    types: EmojiType[];
    question: string;
}

const REVIEW_OPTIONS: ReadonlyArray<ReviewBlock> = [
    { types: ["toobad", "bad"], question: "어떤 점이 아쉬우셨나요?" },
    { types: ["soso"], question: "어떤 점을 더 개선하면 좋을까요?" },
    { types: ["good", "sogood"], question: "어떤 점이 좋았나요?" },
];

const emojiToFeedbackType = (emoji: EmojiType): FeedbackTagType => {
    if (emoji === "toobad" || emoji === "bad") return "NEGATIVE";
    if (emoji === "soso") return "NEUTRAL";
    return "POSITIVE";
};

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

interface UseReviewPopupParams {
    groupId: string;
    onClose: () => void;
    onExitGroup: () => void;
}

export function useReviewPopup({ groupId, onClose, onExitGroup }: UseReviewPopupParams) {
    const emojis: EmojiType[] = ["toobad", "bad", "soso", "good", "sogood"];

    const [selectedEmoji, setSelectedEmoji] = useState<EmojiType | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [etcText, setEtcText] = useState("");
    const [awardCharacter, setAwardCharacter] =
        useState<AwardCharacterState | null>(null);

    const block = useMemo(() => {
        if (!selectedEmoji) return null;
        return REVIEW_OPTIONS.find((b) => b.types.includes(selectedEmoji)) ?? null;
    }, [selectedEmoji]);

    const feedbackType: FeedbackTagType | undefined = useMemo(
        () => (selectedEmoji ? emojiToFeedbackType(selectedEmoji) : undefined),
        [selectedEmoji]
    );

    const { data: feedbackTags = [], isPending } = useFeedbackTags(feedbackType);
    const { mutateAsync: createFeedback, isPending: isSubmitting } =
        useCreateFeedback();
    const { mutateAsync: exitSession } = useExitGroupSession();
    const { mutateAsync: checkAward } = useCheckAward();

    const handleEmojiClick = (emoji: EmojiType) => {
        setSelectedEmoji((prev) => (prev === emoji ? null : emoji));
        setSelectedTags([]);
    };

    const toggleTag = (code: string) => {
        setSelectedTags((prev) =>
            prev.includes(code) ? prev.filter((t) => t !== code) : [...prev, code]
        );
    };

    const handleChangeEtc = (value: string) => setEtcText(value);

    const handleSubmit = async () => {
        if (!selectedEmoji) return;

        try {
            const score = emojiToScore(selectedEmoji);

            await Promise.all([
                createFeedback({
                    score,
                    tagCodes: selectedTags,
                    content: etcText.trim(),
                }),
                exitSession(groupId),
            ]);

            const { totalStudyTime } = await getTotalStudyTime();
            const awards = await checkAward({
                totalStudyTimeInSeconds: totalStudyTime,
            });


            if (awards && awards.length > 0) {
                const first = awards[0];
                setAwardCharacter({
                    level: first.level,
                    name: first.name,
                    imageSrc: first.mainCharacterImage,
                    hours: Math.floor(totalStudyTime / 3600),
                });
                return;
            }

            onClose();
            onExitGroup();
        } catch (e) {
            console.error("[ReviewPopup] handleSubmit error:", e);
        }
    };

    const handleAwardModalClose = () => {
        setAwardCharacter(null);
        onClose();
        onExitGroup();
    };

    return {
        emojis,
        selectedEmoji,
        selectedTags,
        etcText,
        block,
        feedbackTags,
        isPendingTags: isPending,
        isSubmitting,
        awardCharacter,

        handleEmojiClick,
        toggleTag,
        handleChangeEtc,
        handleSubmit,
        handleAwardModalClose,
    };
}
