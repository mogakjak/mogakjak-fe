"use client";

import { useMemo } from "react";
import clsx from "clsx";
import Image from "next/image";

export type WorkItemProps = {
  id?: string;
  date: Date | string;
  title: string;
  targetSeconds: number;
  currentSeconds: number;
  completed?: boolean;
  onToggleCompleted?: (next: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
};

function toDateLabel(d: Date | string) {
  if (typeof d === "string") return d;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function toHHMMSS(total: number) {
  const s = Math.max(0, Math.floor(total));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function WorkItem({
  date,
  title,
  targetSeconds,
  currentSeconds,
  completed = false,
  onToggleCompleted,
  onEdit,
  onDelete,
  className,
}: WorkItemProps) {
  const safeTarget = Math.max(0, targetSeconds || 0);
  const baseCurrent = Math.max(0, currentSeconds || 0);
  const displayCurrent = completed ? safeTarget : Math.min(baseCurrent, safeTarget);
  const percentNum = useMemo(() => {
    if (completed) return 100;
    if (safeTarget === 0) return 0;
    return Math.min(100, Math.round((displayCurrent / safeTarget) * 100));
  }, [completed, displayCurrent, safeTarget]);
  const percentLabel = `${percentNum}%`;

  return (
    <div
      className={clsx(
        "w-full h-36 pl-4 pr-5 py-4 bg-gray-100 rounded-xl",
        "outline-1 outline-gray-200",
        "inline-flex justify-start items-start gap-4 overflow-hidden",
        className,
      )}
      data-property-1={completed ? "finished" : "Default"}
      role="group"
      aria-label="work item"
    >
      <button
        type="button"
        aria-pressed={completed}
        aria-label={completed ? "완료 해제" : "완료 처리"}
        onClick={() => onToggleCompleted?.(!completed)}
        className={clsx(
          "w-6 h-6 relative overflow-hidden shrink-0 rounded-[4px]",
          "outline-none",
        )}
      >
        <Image
          src={completed ? "/Icons/checkboxSelected.svg" : "/Icons/checkboxDefault.svg"}
          alt={completed ? "체크됨" : "미체크"}
          className="w-6 h-6"
          width={24}
          height={24}
        />
      </button>

      <div className={clsx("flex-1 inline-flex flex-col justify-start items-start gap-5", completed && "opacity-50")}>
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="inline-flex flex-col justify-start items-start gap-1">
            <div className="text-zinc-500 text-xs font-normal leading-none">
              {toDateLabel(date)}
            </div>
            <div
              className={clsx(
                "text-neutral-700 text-base font-semibold leading-snug",
                completed && "line-through",
              )}
            >
              {title}
            </div>
          </div>

          <div className="flex justify-end items-center gap-4">
            <button type="button" onClick={onEdit} aria-label="편집" className="w-6 h-6 relative overflow-hidden">
              <Image src="/Icons/edit.svg" alt="편집" className="w-6 h-6" width={24} height={24} />
            </button>
            <button type="button" onClick={onDelete} aria-label="삭제" className="w-6 h-6 relative overflow-hidden">
              <Image src="/Icons/delete.svg" alt="삭제" className="w-6 h-6" width={24} height={24} />
            </button>
          </div>
        </div>

        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="text-red-500 text-base font-semibold leading-snug">
              {percentLabel}
            </div>

            <div className="flex justify-start items-center gap-7">
              <div className="flex justify-start items-center gap-2">
                <div className="text-zinc-700 text-sm font-normal leading-tight">목표 달성 시간</div>
                <div className="text-zinc-500 text-sm font-normal leading-tight">
                  {toHHMMSS(safeTarget)}
                </div>
              </div>

              <div className="flex justify-start items-center gap-2">
                <div className="text-zinc-700 text-sm font-normal leading-tight">현재 달성 시간</div>
                <div className="text-zinc-500 text-sm font-normal leading-tight">
                  {toHHMMSS(displayCurrent)}
                </div>
              </div>
            </div>
          </div>

          <div className="self-stretch bg-gray-200 rounded-[80px] inline-flex justify-start items-start gap-2.5 overflow-hidden">
            <div
              className="h-4 bg-red-400 rounded-[80px]"
              style={{ width: `${percentNum >= 100 ? 100 : percentNum}%`, minWidth: percentNum > 0 ? 8 : 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
