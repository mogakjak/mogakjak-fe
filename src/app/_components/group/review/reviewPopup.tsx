"use client";

import GainCharacterModal from "../../common/gainCharacterModal";
import { ReviewPopupContent } from "./reviewPopupContent";
import { useReviewPopup } from "@/app/_hooks/characters/useReviewPopup";

interface ReviewPopupProps {
  groupName: string;
  sessionId: string;
  groupId: string;
  onClose: () => void;
  onExitGroup: () => void;
}

export default function ReviewPopup({
  groupName,
  groupId,
  onClose,
  onExitGroup,
}: ReviewPopupProps) {
  const {
    emojis,
    selectedEmoji,
    selectedTags,
    etcText,
    block,
    feedbackTags,
    isPendingTags,
    isSubmitting,
    awardCharacter,
    handleEmojiClick,
    toggleTag,
    handleChangeEtc,
    handleSubmit,
    handleAwardModalClose,
  } = useReviewPopup({ onClose, onExitGroup });

  return (
    <>
      <ReviewPopupContent
        groupName={groupName}
        emojis={emojis}
        selectedEmoji={selectedEmoji}
        block={block}
        feedbackTags={feedbackTags}
        selectedTags={selectedTags}
        isPendingTags={isPendingTags}
        etcText={etcText}
        isSubmitting={isSubmitting}
        onClose={onClose}
        onEmojiClick={handleEmojiClick}
        onToggleTag={toggleTag}
        onChangeEtc={handleChangeEtc}
        onSubmit={handleSubmit}
      />

      {awardCharacter && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40">
          <GainCharacterModal
            level={awardCharacter.level}
            imageSrc={awardCharacter.imageSrc}
            name={awardCharacter.name}
            onClose={handleAwardModalClose}
          />
        </div>
      )}
    </>
  );
}
