// components/RecordBoard.tsx
"use client";
import { useMemo } from "react";
import RecordDot, { RecordLevel } from "./recordDot";
import RecordLegend from "./recordLegend";

type DataMap = Record<string, number>;

export type RecordBoardProps = {
  data: DataMap;
  dotSize?: number;
  gap?: number;
};

export function minutesToLevel(minutes = 0): RecordLevel {
  const h = minutes / 60;
  if (h < 1) return 0;
  if (h < 3) return 1;
  if (h < 6) return 2;
  if (h < 9) return 3;
  return 4;
}

const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];
const WEEKDAY_LABELS_MON = ["월", "화", "수", "목", "금", "토", "일"];

export default function RecordBoard({
  data,
  dotSize = 18,
  gap = 6,
}: RecordBoardProps) {
  const values = useMemo(() => Object.values(data), [data]);
  const columnWidth = dotSize + gap;
  const rowHeight = dotSize + gap;

  return (
    <div className="w-full overflow-x-auto bg-white rounded-[20pxz] p-6">
      <div className="ml-11 mb-2 flex select-non gap-20">
        {MONTH_LABELS.map((m) => (
          <p key={m} className="text-center text-body2-14SB text-gray-800">
            {m}
          </p>
        ))}
      </div>

      <div className="flex">
        <div className="text-body2-14SB flex flex-col justify-between text-gray-800 w-10">
          {WEEKDAY_LABELS_MON.map((lab) => (
            <div
              key={lab}
              className="flex items-center"
              style={{ height: rowHeight }}
            >
              {lab}
            </div>
          ))}
        </div>

        <div className="flex">
          {Array.from({ length: 52 }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="flex flex-col"
              style={{ marginRight: gap / 2 }}
            >
              {Array.from({ length: 7 }).map((__, rowIdx) => {
                const flatIdx = colIdx * 7 + rowIdx;
                const minutes = values[flatIdx] ?? 0;
                const level = minutesToLevel(minutes);
                return (
                  <div
                    key={rowIdx}
                    className="flex items-center justify-center"
                    style={{ width: columnWidth, height: rowHeight }}
                  >
                    <RecordDot
                      level={level}
                      size={dotSize}
                      title={`${Math.floor(minutes / 60)}h ${minutes % 60}m`}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <RecordLegend dotSize={dotSize} />
    </div>
  );
}
