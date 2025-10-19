"use client";

import React from "react";
import clsx from "clsx";
import DataCard from "./dataCard";
import { formatHM } from "../../../_utils/formatHM";

interface CardsProps {
  totalFocusSec: number;
  groupFocusSec: number;
  personalFocusSec: number;
  doneTasks: number;
}

export default function Cards({
  totalFocusSec,
  groupFocusSec,
  personalFocusSec,
  doneTasks,
}: CardsProps) {
  console.log(totalFocusSec);
  return (
    <div className={clsx("grid grid-cols-4 gap-4 mt-[104px]")}>
      <DataCard
        title="총 몰입 시간"
        value={formatHM(totalFocusSec)}
        accent="green"
      />

      <DataCard
        title={
          <>
            <span className="font-bold text-black">모각작</span> 몰입 시간
          </>
        }
        value={formatHM(groupFocusSec)}
        accent="orange"
      />

      <DataCard
        title={
          <>
            <span className="font-bold text-black">개인</span> 몰입 시간
          </>
        }
        value={formatHM(personalFocusSec)}
        accent="orange"
      />

      <DataCard title="완료한 할 일" value={`${doneTasks}개`} accent="orange" />
    </div>
  );
}
