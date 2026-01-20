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
      <div className={clsx("w-full flex flex-col gap-1", className)}>
        <Button
          variant="primary2"
          size="custom"
          className="text-body2-14SB h-8 text-base rounded-lg w-full pt-1"
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
        {onPipToggle && !isInPip && (
          <button
            onClick={onPipToggle}
            aria-label="PIP 열기"
            className="self-stretch h-8 pl-2 pr-2.5 py-1 bg-zinc-600 rounded-lg inline-flex justify-center items-center gap-1 overflow-hidden"
          >
            <div className="w-6 h-6 relative overflow-hidden">
              <Image
                src="/Icons/pip.svg"
                alt="PIP"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </div>
            <div className="justify-start text-neutral-50 text-sm font-semibold font-['Pretendard'] leading-5">
              PIP 열기
            </div>
          </button>
        )}
      </div>
    );
  }

  const isBreakPhase = currentPhase === "BREAK";
  const pauseButtonText = isBreakPhase ? "다시 시작" : "휴식";
  const pauseButtonIcon = isBreakPhase
    ? "/Icons/startWhite.svg"
    : "/Icons/pauseWhite.svg";

  return (
    <div className={clsx("w-full flex flex-col gap-1", className)}>
      <div className="w-full flex items-center gap-3">
        <Button
          variant="slate600"
          className={clsx(
            " text-body2-14SB h-9 text-base rounded-lg w-full flex-1 pt-1",
            isBreakPhase && "bg-gray600 hover:bg-gray600/90",
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
          variant="primary2"
          className={clsx(
            " text-body2-14SB h-9 text-base rounded-lg w-full flex-1 pt-1",
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
        <button
          onClick={onPipToggle}
          className="self-stretch h-9 pl-2 pr-2.5 py-1 bg-zinc-600 rounded-lg inline-flex justify-center items-center gap-1 overflow-hidden"
        >
          <div className="w-6 h-6 relative overflow-hidden">
            <Image
              src="/Icons/pip.svg"
              alt="PIP"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </div>
          <div className="justify-start text-neutral-50 text-sm font-semibold font-['Pretendard'] leading-5">
            PIP 열기
          </div>
        </button>
      )}
    </div>
  );
}
