"use client";

import Image from "next/image";
import { LinearProgress, linearProgressClasses, styled } from "@mui/material";

const RoundedLinearProgress = styled(LinearProgress)(() => ({
  height: 12,
  borderRadius: 9999,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#e5e7eb",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 9999,
    backgroundColor: "#f87171",
  },
}));

type PreviewCharacterProps = {
  progress?: number;
};

export default function PreviewCharacter({
  progress = 50,
}: PreviewCharacterProps) {
  const v = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="flex flex-col">
      <p className="text-heading4-20SB mb-6">김나은 (나)</p>
      <div className="flex flex-col items-center pt-1.5 gap-5">
        <Image
          src="/character/tomato.svg"
          alt="캐릭터"
          width={135}
          height={135}
        />
        <p className="text-body1-16SB">Lv2.부끄뽀모</p>
      </div>
    </div>
  );
}
