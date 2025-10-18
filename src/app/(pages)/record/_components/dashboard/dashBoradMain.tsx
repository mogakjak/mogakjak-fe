import DashBorad from "./dashBorad";

export default function DashBoradMain() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-5 mb-5">
        <p className="text-heading4-20SB text-black">대시보드</p>
        <p className="text-body1-16R text-gray-600">
          기간 별로 몰입 통계를 확인해보세요
        </p>
      </div>

      <DashBorad />
    </div>
  );
}
