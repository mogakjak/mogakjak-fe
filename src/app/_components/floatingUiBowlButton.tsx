"use client";

import Image from "next/image";
import { sendGAEvent } from "@next/third-parties/google";
import { UI_BOWL_VOTE_URL } from "@/app/_constants/uiBowlVote";

export default function FloatingUiBowlButton() {
  const handleClick = () => {
    sendGAEvent("event", "ui_bowl_vote_floating_click");
    if (UI_BOWL_VOTE_URL) {
      window.open(UI_BOWL_VOTE_URL, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="h-14 shrink-0 px-5 py-3 bg-neutral-50 rounded-[80px] shadow-[0px_0px_20px_0px_rgba(0,0,0,0.15)] inline-flex justify-start items-center gap-2 hover:bg-neutral-100 transition-colors"
      aria-label="ui bowl 투표 중"
    >
      <span className="text-neutral-900 text-xl font-semibold leading-7 whitespace-nowrap">
        ui bowl 투표 중
      </span>
      <span className="w-8 h-8 shrink-0 flex items-center justify-center bg-red-500 rounded-full overflow-hidden">
        <Image
          src="/Icons/arrowFloating.svg"
          alt=""
          width={32}
          height={32}
          className="w-8 h-8"
          aria-hidden
        />
      </span>
    </button>
  );
}
