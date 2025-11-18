"use client";

import React from "react";
import clsx from "clsx";
import DataCard from "./dataCard";
import { formatHMS } from "../../../_utils/formatHMS";

interface CardsProps {
  totalFocusSec: number;
  groupFocusSec: number;
  personalFocusSec: number;
  doneTasks: number;
  isPending?: boolean;
}

export default function Cards({
  totalFocusSec,
  groupFocusSec,
  personalFocusSec,
  doneTasks,
  isPending = false,
}: CardsProps) {
  return (
    <div className={clsx("grid grid-cols-4 gap-4 mt-[104px]")}>
      {isPending ? (
        Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="w-full h-[120px] rounded-[20px] bg-gray-100 animate-pulse"
          />
        ))
      ) : (
        <>
          <DataCard
            title="총 몰입 시간"
            value={formatHMS(totalFocusSec)}
            accent="green"
          />

          <DataCard
            title={
              <>
                <span className="font-bold text-black">모각작</span> 몰입 시간
              </>
            }
            value={formatHMS(groupFocusSec)}
            accent="orange"
          />

          <DataCard
            title={
              <>
                <span className="font-bold text-black">개인</span> 몰입 시간
              </>
            }
            value={formatHMS(personalFocusSec)}
            accent="orange"
          />

          <DataCard
            title="완료한 할 일"
            value={`${doneTasks}개`}
            accent="orange"
          />
        </>
      )}
    </div>
  );
}
