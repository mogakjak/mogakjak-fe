"use client";

import clsx from "clsx";
import Image from "next/image";
import { Button } from "@/components/button";

type Mode = "pomodoro" | "stopwatch" | "timer";

export type TimerButtonsProps = {
  mode?: Mode;
  running: boolean;
  className?: string;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
};

export default function TimerButtons({
  mode = "pomodoro",
  running,
  className,
  onStart,
  onPause,
  onStop,
}: TimerButtonsProps) {
  if (!running) {
    return (
      <div className={clsx("w-full flex items-center gap-3", className)}>
        <Button
          variant="slate600"
          className="flex-1 rounded-2xl"
          onClick={onStart}
          leftIcon={null}
        >
          <span className="inline-flex items-center gap-2">
            <Image
              src="/Icons/startWhite.svg"
              alt="start"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            시작할래요
          </span>
        </Button>
      </div>
    );
  }
  const restBtnClass =
    mode === "pomodoro"
      ? "flex-1" 
      : "w-[160px]"; 

  return (
    <div className={clsx("w-full flex items-center gap-3", className)}>
      <Button
        variant="slate600"
        className={clsx("rounded-2xl", restBtnClass)}
        onClick={onPause}
        leftIcon={null}
      >
        <span className="inline-flex items-center gap-2">
          <Image
            src="/Icons/pauseWhite.svg"
            alt="pause"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          휴식
        </span>
      </Button>
      <Button
        variant="primary"
        className={clsx("rounded-2xl", mode === "pomodoro" ? "w-[180px]" : "w-[160px]")}
        onClick={onStop}
        leftIcon={null}
      >
        <span className="inline-flex items-center gap-2">
          <Image
            src="/Icons/stopWhite.svg"
            alt="stop"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          종료
        </span>
      </Button>
    </div>
  );
}
