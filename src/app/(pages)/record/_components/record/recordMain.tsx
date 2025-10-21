import RecordBoard from "./recordBoard";

type DataMap = Record<string, number>;

export default function RecordMain() {
  const data: DataMap = {
    "2025-01-01": 100,
    "2025-01-02": 200,
    "2025-01-03": 300,
    "2025-01-04": 400,
    "2025-01-05": 500,
  };
  return (
    <div className="w-full mt-[60px]">
      <div className="flex items-center gap-5 mb-5">
        <p className="text-heading4-20SB text-black">몰입 기록</p>
        <p className="text-body1-16R text-gray-600">
          모든 몰입 여정을 하나의 캘린더에서 확인해 보세요.
        </p>
      </div>
      <RecordBoard data={data} />
    </div>
  );
}
