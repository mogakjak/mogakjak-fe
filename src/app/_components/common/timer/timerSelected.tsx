"use client";

import clsx from "clsx";
import { Button } from "@/components/button";
import { sendGAEvent } from "@next/third-parties/google";
import {
  TIMER_MODE_LABELS,
  normalizeTabOrderToModes,
  type TimerMode,
} from "@/app/_utils/defaultTimerMode";

type Mode = TimerMode;

export default function TimerSelected({
  value = "pomodoro",
  onChange,
  size = "custom",
  className = "text-body2-14SB h-7 text-base rounded-lg w-full",
  modeOrder,
}: {
  value?: Mode;
  onChange?: (v: Mode) => void;
  size?: "md" | "sm" | "custom";
  className?: string;
  /** 기본 타이머가 맨 앞에 오도록 정렬 (미지정 시 pomodoro 우선) */
  modeOrder?: Mode[];
}) {
  const orderedModes = modeOrder ?? normalizeTabOrderToModes(null);

  const handleModeChange = (mode: Mode) => {
    onChange?.(mode);

    sendGAEvent("event", "select_timer_mode", {
      type: mode,
    });
  };

  return (
    <div className={clsx("grid grid-cols-3 gap-1", className)}>
      {orderedModes.map((mode) => (
        <Button
          key={mode}
          variant={value === mode ? "selected" : "muted"}
          onClick={() => handleModeChange(mode)}
          size={size}
          aria-pressed={value === mode}
          className={className}
        >
          {TIMER_MODE_LABELS[mode]}
        </Button>
      ))}
    </div>
  );
}
