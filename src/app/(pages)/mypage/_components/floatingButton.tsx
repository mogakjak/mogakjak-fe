"use client";

import { useState } from "react";
import SupportModal from "@/app/_components/common/supportModal";
import Image from "next/image";
import FloatingUiBowlButton from "@/app/_components/floatingUiBowlButton";
import { sendGAEvent } from "@next/third-parties/google";

function FloatingSupportFab({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="shrink-0 w-20 h-20"
      aria-label="문의하기"
    >
      <Image src="/Icons/fab.svg" alt="" width={80} height={80} className="w-20 h-20" />
    </button>
  );
}

export default function FloatingButtons() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    sendGAEvent("event", "support_click", { action: "open" });
    setIsOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
        <FloatingUiBowlButton />
        <FloatingSupportFab onOpen={handleOpen} />
      </div>

      <SupportModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
