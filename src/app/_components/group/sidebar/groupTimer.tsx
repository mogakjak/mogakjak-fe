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
    <div className="w-full flex items-center gap-5">
      <div className="w-[346px] flex flex-col justify-center items-center rounded-2xl py-[10px] bg-gray-100">
        <p
          className={`text-heading1-32B whitespace-nowrap ${
            status === "running" ? "text-gray-800" : "text-gray-400"
          }`}
        >
          {formatTime(elapsedSeconds)}
        </p>
        <p
          className={`text-body1-16M ${
            status === "running" ? "text-gray-800" : "text-gray-400"
          }`}
        >
          누적 시간 {formatTime(totalSeconds)}
        </p>
      </div>

      {status === "idle" && (
        <button
          onClick={handleStart}
          className="bg-gray-600 px-8 py-1.5 text-white rounded-lg text-body2-14SB flex justify-center items-center gap-2"
        >
          <Icon Svg={StartIcon} size={24} className="text-white" />
          시작
        </button>
      )}

      {status === "running" && (
        <div className="flex flex-col gap-2">
          <button
            onClick={handlePause}
            className="bg-gray-600 px-8 text-body2-14SB text-white rounded-lg py-1.5 flex justify-center items-center gap-2"
          >
            <Icon Svg={Pause} size={24} className="text-white" />
            휴식
          </button>
          <button
            onClick={handleStop}
            className="px-8 text-body2-14SB bg-red-400 text-white rounded-lg py-1.5 flex justify-center items-center gap-2"
          >
            <Icon Svg={Stop} size={24} className="text-white" />
            종료
          </button>
        </div>
      )}
    </div>
  );
}
