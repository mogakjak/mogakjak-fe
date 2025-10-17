// components/RecordLegend.tsx
import RecordDot from "./recordDot";

export default function RecordLegend({ dotSize = 16 }: { dotSize?: number }) {
  return (
    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
      <span className="whitespace-nowrap">기록 강도</span>
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((lv) => (
          <RecordDot key={lv} level={lv as 0 | 1 | 2 | 3 | 4} size={dotSize} />
        ))}
      </div>
      <span className="ml-2 text-gray-400">
        0~1h / 1~3h / 3~6h / 6~9h / 9h~
      </span>
    </div>
  );
}
