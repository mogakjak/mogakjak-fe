"use client";

import clsx from "clsx";
import { Button } from "@/components/button";
import { Icon } from "./Icon";

type Mode = "pomodoro" | "stopwatch" | "timer";

export default function TimerSelected({
  value = "pomodoro",
  onChange,
  size = "md",
  className,
}: {
  value?: Mode;
  onChange?: (v: Mode) => void;
  size?: "md" | "sm";
  className?: string;
}) {
  return (
    <div className={clsx("inline-flex items-center gap-2", className)}>
      <Button
        variant={value === "pomodoro" ? "selected" : "muted"}
        size={size}
        className="min-w-[181px] justify-start"
        onClick={() => onChange?.("pomodoro")}
        leftIcon={<Icon name="pomodoro" />}
        aria-pressed={value === "pomodoro"}
      >
        뽀모도로
      </Button>

      <Button
        variant={value === "stopwatch" ? "selected" : "muted"}
        size={size}
        className="min-w-[181px] justify-start"
        onClick={() => onChange?.("stopwatch")}
        leftIcon={<Icon name="stopwatch" />}
        aria-pressed={value === "stopwatch"}
      >
        스톱워치
      </Button>

      <Button
        variant={value === "timer" ? "selected" : "muted"}
        size={size}
        className="min-w-[181px] justify-start"
        onClick={() => onChange?.("timer")}
        leftIcon={<Icon name="timer" />}
        aria-pressed={value === "timer"}
      >
        타이머
      </Button>
    </div>
  );
}
