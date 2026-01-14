"use client";

import { useDailyRecords } from "@/app/_hooks/records/useDailyRecords";
import RecordBoard from "./recordBoard";

export default function RecordMain() {
  const { isPending } = useDailyRecords();

  return (
    <div className="w-full mt-[60px]">
      <div className="flex items-center gap-5 mb-5">
        <p className="text-heading4-20SB text-black">몰입 기록</p>
        <p className="text-body1-16R text-gray-600">
          모든 몰입 여정을 하나의 캘린더에서 확인해 보세요.
        </p>
      </div>
      {isPending ? (
        <div className="w-full h-[230px] bg-white rounded-[20px] shadow-sm animate-pulse" />
      ) : (
        <RecordBoard />
      )}
    </div>
  );
}
