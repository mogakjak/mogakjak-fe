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
    <div className="flex flex-col border border-gray-200 rounded-[12px] p-4 mt-5">
      <div className="flex flex-col items-center pt-1.5">
        <Image
          src="/character/tomato.svg"
          alt="캐릭터"
          width={135}
          height={135}
        />
        <p className="text-body1-16SB text-red-500">Lv2.부끄뽀모</p>
      </div>
      <p className="text-center mt-[27px]">다음 캐릭터 획득까지</p>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1">
          <RoundedLinearProgress
            variant="determinate"
            value={v}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={v}
          />
        </div>
        <span className="text-red-400 text-body1-16SB">{v}%</span>
      </div>
    </div>
  );
}
