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
    <div className="w-full">
      <div>
        <p>몰입기록</p>
        <p>모든 몰입 여정을 하나의 캘린더에서 확인해 보세요.</p>
      </div>
      <RecordBoard data={data} />
    </div>
  );
}
