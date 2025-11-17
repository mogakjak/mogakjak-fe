"use client";

import { useMemo } from "react";
import RecordDot, { RecordLevel } from "./recordDot";
import RecordLegend from "./recordLegend";
import RecordToolTip from "./recordToolTip";
import { formatHM } from "../../_utils/formatHM";
import { useDailyRecords } from "@/app/_hooks/records";

export function secondsToLevel(seconds = 0): RecordLevel {
  const h = seconds / 3600;
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

const COLS = 53;
const ROWS = 7;

export default function RecordBoard() {
  const { data, isPending } = useDailyRecords();

  const grid = useMemo(() => {
    const baseGrid = Array.from({ length: COLS }, () =>
      Array<number>(ROWS).fill(0)
    );

    if (!data || data.length === 0) return baseGrid;

    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

    const first = sorted[0];
    const firstDow = first.dayOfWeek;
    const offset = firstDow - 1;

    sorted.forEach((day, index) => {
      const globalIdx = offset + index;
      const col = Math.floor(globalIdx / 7);
      const row = globalIdx % 7;

      if (col < COLS) {
        baseGrid[col][row] = day.totalSeconds;
      }
    });

    return baseGrid;
  }, [data]);

  return (
    <div className="w-full bg-white rounded-[20px] px-10 py-10">
      {isPending ? (
        <div className="w-full h-[230px] bg-gray-100 rounded-[20px] animate-pulse" />
      ) : (
        <>
          <div className="flex justify-center w-full">
            <div className="pt-7 text-body2-14SB flex flex-col justify-between text-gray-800 mr-4">
              {WEEKDAY_LABELS_MON.map((lab) => (
                <div key={lab} className="flex items-center">
                  {lab}
                </div>
              ))}
            </div>

            <div className="flex flex-col">
              <div className="mb-2 flex gap-20">
                {MONTH_LABELS.map((m) => (
                  <p
                    key={m}
                    className="text-center text-body2-14SB text-gray-800"
                  >
                    {m}
                  </p>
                ))}
              </div>

              <div className="flex gap-1.5">
                {Array.from({ length: COLS }).map((_, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-1.5">
                    {Array.from({ length: ROWS }).map((__, rowIdx) => {
                      const seconds = grid[colIdx][rowIdx] ?? 0;
                      const level = secondsToLevel(seconds);

                      return (
                        <div
                          key={rowIdx}
                          className="flex items-center justify-center"
                        >
                          <RecordToolTip
                            label={formatHM(Math.floor(seconds / 60))}
                          >
                            <RecordDot level={level} />
                          </RecordToolTip>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <RecordLegend />
        </>
      )}
    </div>
  );
}
