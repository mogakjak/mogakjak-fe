"use client";

import React, { useMemo } from "react";
import { categoryTime } from "../../../_utils/categoryTime";
import { formatHMS } from "../../../_utils/formatHMS";

interface BaseItem {
  category: string;
}
type TimeItem = BaseItem & { seconds: number };
type CountItem = BaseItem & { currentCount: number; totalCount: number };

interface CategoryStatsProps {
  type: "time" | "count";
  items: (TimeItem | CountItem)[];
}

function isTimeItem(item: TimeItem | CountItem): item is TimeItem {
  return typeof (item as TimeItem).seconds === "number";
}

const FALLBACK_PALETTE = [
  "#f86e64",
  "#ffa569",
  "#fbda55",
  "#73e07a",
  "#69e3f6",
  "#6297f3",
  "#a27bf0",
];

export default function CategoryStats({ type, items }: CategoryStatsProps) {
  const coloredItems = useMemo(() => {
    const base = items.map((item) => ({
      category: item.category,
      seconds: isTimeItem(item) ? item.seconds : 0,
    }));

    const withColor = categoryTime(base);

    return withColor.map((c, idx) => {
      const raw = (c.color || "").trim();
      const safeColor =
        raw.length > 0 ? raw : FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];

      return { ...c, color: safeColor };
    });
  }, [items]);

  return (
    <div className="category-scroll h-[274px] overflow-y-auto space-y-4 pr-2">
      {items.map((item, idx) => {
        const color =
          coloredItems[idx]?.color ||
          FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];

        return (
          <div key={item.category + "_" + idx} className="flex items-center">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="inline-block w-4 h-4 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="w-[150px] max-w-[150px] text-gray-600 text-body1-16R truncate">
                {item.category}
              </span>
            </div>

            {type === "time" && isTimeItem(item) ? (
              <span className="text-gray-800 text-body1-16SB ml-auto mr-[100px]">
                {formatHMS(item.seconds)}
              </span>
            ) : (
              <div className="flex items-center gap-1 text-gray-800 text-body1-16SB mr-[100px] ml-auto">
                <span>{(item as CountItem).currentCount}개</span>
                <span className="text-gray-400">/</span>
                <span>{(item as CountItem).totalCount}개</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
