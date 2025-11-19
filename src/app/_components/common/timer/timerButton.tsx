"use client";

import clsx from "clsx";
import Image from "next/image";
import { Button } from "@/components/button";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Mode = "pomodoro" | "stopwatch" | "timer";

export type TimerButtonsProps = {
  running: boolean;
  className?: string;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onPipToggle?: () => void;
  isInPip?: boolean;
  currentPhase?: "FOCUS" | "BREAK";
};

export default function TimerButtons({
  running,
  className,
  onStart,
  onPause,
  onStop,
  onPipToggle,
  isInPip = false,
  currentPhase = "FOCUS",
}: TimerButtonsProps) {
  if (!running) {
    return (
      <div className={clsx("w-full flex items-center gap-3", className)}>
        <Button
          variant="slate600"
          size="custom"
          className="text-body2-14SB h-9 text-base rounded-lg w-full"
          onClick={onStart}
          leftIcon={null}
          data-pip-action="start"
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

  const isBreakPhase = currentPhase === "BREAK";
  const pauseButtonText = isBreakPhase ? "다시 시작" : "휴식";
  const pauseButtonIcon = isBreakPhase ? "/Icons/startWhite.svg" : "/Icons/pauseWhite.svg";

  return (
    <div className={clsx("w-full flex flex-col gap-3", className)}>
      <div className="w-full flex items-center gap-3">
      <Button
        variant="slate600"
        className={clsx(
            " text-body2-14SB h-8 text-base rounded-lg w-full flex-1",
            isBreakPhase && "bg-gray600 hover:bg-gray600/90"
        )}
        size="custom"
        onClick={onPause}
        leftIcon={null}
          data-pip-action="pause"
          style={isBreakPhase ? { backgroundColor: "#585D63" } : undefined}
      >
        <span className="inline-flex items-center gap-2 justify-center">
          <Image
              src={pauseButtonIcon}
              alt={pauseButtonText}
            width={24}
            height={24}
            className="w-6 h-6"
          />
            {pauseButtonText}
        </span>
      </Button>
      <Button
        variant="primary"
        className={clsx(
          " text-body2-14SB h-8 text-base rounded-lg w-full flex-1"
        )}
        size="custom"
        onClick={onStop}
        leftIcon={null}
          data-pip-action="stop"
      >
        <span className="inline-flex items-center gap-2 justify-center">
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
      {onPipToggle && !isInPip && (
        <Button
          variant="slate600"
          className="text-body2-14SB h-8 text-base rounded-lg w-full"
          size="custom"
          onClick={onPipToggle}
          leftIcon={null}
        >
          <span className="inline-flex items-center gap-2 justify-center">
            PIP 열기
          </span>
        </Button>
      )}
    </div>
  );
}
