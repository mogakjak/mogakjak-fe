"use client";

import { useRecordDashboard } from "@/app/_hooks/records/useRecordDashboard";
import DashBorad from "./dashBorad";

export default function DashBoradMain() {
  const { isPending } = useRecordDashboard("TODAY");

  return (
    <div className="w-full">
      <div className="flex items-center gap-5 mb-5 mt-12">
        <p className="text-heading4-20SB text-black">대시보드</p>
        <p className="text-body1-16R text-gray-600">
          기간 별로 몰입 통계를 확인해보세요.
        </p>
      </div>

      {isPending ? (
        <div className="w-full h-[400px] bg-white rounded-[20px] shadow-sm animate-pulse" />
      ) : (
        <DashBorad />
      )}
    </div>
  );
}
