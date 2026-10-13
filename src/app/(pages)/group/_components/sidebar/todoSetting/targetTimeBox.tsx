"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Icon from "@/app/_components/common/Icons";
import Edit from "/Icons/edit.svg";
import { secondsToHms } from "@/app/_utils/todoTimer";

const MIN_TARGET_SECONDS = 60;
const MAX_TARGET_SECONDS = 24 * 3600;

const NUMBER_INPUT_CLASS =
  "w-6 bg-transparent text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function formatHms(totalSeconds: number) {
  const { hours, minutes, seconds } = secondsToHms(totalSeconds);
  return `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
}

type TargetTimeBoxProps = {
  targetSeconds: number;
  progressRate: number;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  /** 00:00:00으로 적용하면 목표 시간 없음(null) */
  onSubmit: (seconds: number | null) => Promise<void> | void;
  /** 할 일이 선택되지 않았으면 편집 불가 */
  editable?: boolean;
};

export default function TargetTimeBox({
  targetSeconds,
  progressRate,
  editing,
  onEditingChange,
  onSubmit,
  editable = true,
}: TargetTimeBoxProps) {
  const [h, setH] = useState(0);
  const [m, setM] = useState(0);
  const [s, setS] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const hourRef = useRef<HTMLInputElement>(null);
  const targetSecondsRef = useRef(targetSeconds);
  targetSecondsRef.current = targetSeconds;

  useEffect(() => {
    if (!editing) return;
    const { hours, minutes, seconds } = secondsToHms(targetSecondsRef.current);
    setH(hours);
    setM(minutes);
    setS(seconds);
    hourRef.current?.focus();
    hourRef.current?.select();
  }, [editing]);

  const total = h * 3600 + m * 60 + s;
  const isEmpty = total === 0;
  const isValid =
    isEmpty || (total >= MIN_TARGET_SECONDS && total <= MAX_TARGET_SECONDS);

  const handleApply = async () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    try {
      await onSubmit(isEmpty ? null : total);
      onEditingChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleApply();
    } else if (e.key === "Escape") {
      onEditingChange(false);
    }
  };

  // 두 자리로 패딩된 값 뒤에 입력이 붙으므로 마지막 두 자리(범위 초과 시 마지막 한 자리)만 사용
  const toNumber = (value: string, max: number) => {
    const digits = value.replace(/\D/g, "");
    const lastTwo = parseInt(digits.slice(-2) || "0", 10);
    if (lastTwo <= max) return lastTwo;
    return parseInt(digits.slice(-1) || "0", 10);
  };

  return (
    <div className="flex flex-col gap-1 bg-gray-100 rounded-lg px-4 py-3">
      <div className="flex items-center gap-3 h-6">
        <span className="text-body2-14SB text-gray-800 shrink-0">목표 시간</span>
        {editing ? (
          <>
            <div className="flex items-center text-body2-14SB text-red-500">
              <input
                ref={hourRef}
                type="number"
                aria-label="시간"
                value={pad(h)}
                min={0}
                max={24}
                onChange={(e) => setH(toNumber(e.target.value, 24))}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
                className={NUMBER_INPUT_CLASS}
              />
              <span className="px-0.5">:</span>
              <input
                type="number"
                aria-label="분"
                value={pad(m)}
                min={0}
                max={59}
                onChange={(e) => setM(toNumber(e.target.value, 59))}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
                className={NUMBER_INPUT_CLASS}
              />
              <span className="px-0.5">:</span>
              <input
                type="number"
                aria-label="초"
                value={pad(s)}
                min={0}
                max={59}
                onChange={(e) => setS(toNumber(e.target.value, 59))}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
                className={NUMBER_INPUT_CLASS}
              />
            </div>
            <button
              type="button"
              onClick={handleApply}
              disabled={!isValid || isSaving}
              className={clsx(
                "ml-auto px-2 py-0.5 rounded-md text-caption-12SB text-white",
                isValid ? "bg-red-500" : "bg-gray-300",
              )}
            >
              적용
            </button>
          </>
        ) : (
          <>
            <span
              className={clsx(
                "text-body2-14R",
                targetSeconds > 0 ? "text-gray-600" : "text-gray-400",
              )}
            >
              {targetSeconds > 0 ? formatHms(targetSeconds) : "미설정"}
            </span>
            {editable && (
              <button
                type="button"
                onClick={() => onEditingChange(true)}
                aria-label="목표 시간 수정"
                className="ml-auto"
              >
                <Icon Svg={Edit} size={20} className="text-gray-600" />
              </button>
            )}
          </>
        )}
      </div>

      {editing && !isEmpty && (
        <p className="py-1 text-center text-caption-12R text-red-500">
          최소 1분~ 최대 24시간까지만 입력 가능해요
        </p>
      )}

      <div className="flex items-center gap-3 h-6">
        <span className="text-body2-14SB text-gray-800 shrink-0">현재 달성률</span>
        <span className="text-body2-14R text-gray-600">{progressRate}%</span>
      </div>
    </div>
  );
}
