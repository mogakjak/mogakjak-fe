// components/RecordLegend.tsx
import RecordDot from "./recordDot";

export default function RecordLegend({ dotSize = 16 }: { dotSize?: number }) {
  return (
    <div className="mt-6">
      <div className="flex justify-end gap-5">
        {[
          { lv: 0, label: "0~1h 미만" },
          { lv: 1, label: "1~3h 미만" },
          { lv: 2, label: "3~6h 미만" },
          { lv: 3, label: "6~9h 미만" },
          { lv: 4, label: "9h~" },
        ].map(({ lv, label }) => (
          <div key={lv} className="flex items-center gap-2">
            <RecordDot level={lv as 0 | 1 | 2 | 3 | 4} size={dotSize} />
            <span className="text-caption-12R text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
