"use client";

import { useMemo, useState } from "react";
import { useStopwatch } from "react-timer-hook";
import Icon from "../../common/Icons";

// 이미지 관리
import StartIcon from "/Icons/start.svg";
import Pause from "/Icons/pause.svg";
import Stop from "/Icons/stop.svg";
import { formatTime } from "@/app/_utils/formatTime";

type Status = "idle" | "running";

export default function GroupTimer() {
  const [status, setStatus] = useState<Status>("idle");
  const [totalSeconds, setTotalSeconds] = useState(0);

  const stopwatch = useStopwatch({ autoStart: false });

  const elapsedSeconds = useMemo(
    () => stopwatch.hours * 3600 + stopwatch.minutes * 60 + stopwatch.seconds,
    [stopwatch.hours, stopwatch.minutes, stopwatch.seconds]
  );

  const handleStart = () => {
    stopwatch.start();
    setStatus("running");
  };

  const handlePause = () => {
    stopwatch.pause();
    setStatus("idle");
  };

  const handleStop = () => {
    setTotalSeconds((prev) => prev + elapsedSeconds);
    stopwatch.reset(undefined, false);
    setStatus("idle");
  };

  return (
    <div className="w-[311px] h-[149px] bg-gray-100 border border-gray-200 flex flex-col justify-center items-center rounded-lg p-5">
      <p
        className={`text-heading1-32B  ${
          status === "running" ? "text-gray-800" : "text-gray-400"
        }`}
      >
        {formatTime(elapsedSeconds)}
      </p>
      <p
        className={`text-body2-14R mb-3  ${
          status === "running" ? "text-gray-800" : "text-gray-400"
        }`}
      >
        누적 시간 {formatTime(totalSeconds)}
      </p>

      {status === "idle" && (
        <button
          onClick={handleStart}
          className="bg-red-400 py-1.5 text-white rounded-lg w-full text-body2-14SB flex justify-center items-center gap-2"
        >
          <Icon Svg={StartIcon} size={24} className="text-white" />
          시작할래요
        </button>
      )}

      {status === "running" && (
        <div className="flex  w-full gap-2">
          <button
            onClick={handlePause}
            className="w-full text-body2-14SB bg-red-400 text-white rounded-lg py-1.5 flex justify-center items-center gap-0.5"
          >
            <Icon Svg={Pause} size={24} className="text-white" />
            휴식할래요
          </button>
          <button
            onClick={handleStop}
            className="w-full text-body2-14SB bg-red-400 text-white rounded-lg py-1.5 flex justify-center items-center gap-0.5"
          >
            <Icon Svg={Stop} size={24} className="text-white" />
            종료할래요
          </button>
        </div>
      )}
    </div>
  );
}
