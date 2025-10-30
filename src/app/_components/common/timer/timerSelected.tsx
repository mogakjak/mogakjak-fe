"use client";

import clsx from "clsx";
import { Button } from "@/components/button";
import { Icon } from "./Icon";
import { useState } from "react";

type Mode = "pomodoro" | "stopwatch" | "timer";

export default function TimerSelected({
  value,
  onChange,
  size = "md",
  className,
}: {
  value?: Mode;
  onChange?: (v: Mode) => void;
  size?: "md" | "sm";
  className?: string;
}) {
  const [inner, setInner] = useState<Mode>(value ?? "pomodoro");
  const v = value ?? inner;

  const handle = (next: Mode) => {
    if (!value) setInner(next);
    onChange?.(next);
  };

  return (
    <div className={clsx("inline-flex items-center gap-2", className)}>
      <Button
        variant={v === "pomodoro" ? "selected" : "muted"}
        size={size}
        className="min-w-[181px] justify-start"
        onClick={() => handle("pomodoro")}
        leftIcon={<Icon name="pomodoro" />}
        aria-pressed={v === "pomodoro"}
      >
        뽀모도로
      </Button>

      <Button
        variant={v === "stopwatch" ? "selected" : "muted"}
        size={size}
        className="min-w-[181px] justify-start"
        onClick={() => handle("stopwatch")}
        leftIcon={<Icon name="stopwatch" />}
        aria-pressed={v === "stopwatch"}
      >
        스톱워치
      </Button>

      <Button
        variant={v === "timer" ? "selected" : "muted"}
        size={size}
        className="min-w-[181px] justify-start"
        onClick={() => handle("timer")}
        leftIcon={<Icon name="timer" />}
        aria-pressed={v === "timer"}
      >
        타이머
      </Button>
    </div>
  );
}
