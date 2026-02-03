"use client";

import clsx from "clsx";
import { Button } from "@/components/button";

type Mode = "pomodoro" | "stopwatch" | "timer";

export default function TimerSelected({
  value = "pomodoro",
  onChange,
  size = "custom",
  className = "text-body2-14SB h-7 text-base rounded-lg w-full",
}: {
  value?: Mode;
  onChange?: (v: Mode) => void;
  size?: "md" | "sm" | "custom";
  className?: string;
}) {
  return (
    <div className={clsx("grid grid-cols-3 gap-1", className)}>
      <Button
        variant={value === "pomodoro" ? "selected" : "muted"}
        onClick={() => onChange?.("pomodoro")}
        size={size}
        aria-pressed={value === "pomodoro"}
        className={className}
      >
        뽀모도로
      </Button>

      <Button
        variant={value === "timer" ? "selected" : "muted"}
        onClick={() => onChange?.("timer")}
        size={size}
        aria-pressed={value === "timer"}
        className={className}
      >
        타이머
      </Button>
      <Button
        variant={value === "stopwatch" ? "selected" : "muted"}
        onClick={() => onChange?.("stopwatch")}
        aria-pressed={value === "stopwatch"}
        size={size}
        className={className}
      >
        스톱워치
      </Button>
    </div>
  );
}
