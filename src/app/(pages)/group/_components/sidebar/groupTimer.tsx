"use client";

import { useMemo, useState } from "react";
import { useStopwatch } from "react-timer-hook";
import Icon from "../../../../_components/common/Icons";
import {
  useStartGroupTimer,
  usePauseGroupTimer,
  useResumeGroupTimer,
  useFinishGroupTimer,
} from "@/app/_hooks/timers";

// 이미지 관리
import StartIcon from "/Icons/start.svg";
import Pause from "/Icons/pause.svg";
import Stop from "/Icons/stop.svg";
import { formatTime } from "@/app/_utils/formatTime";

type Status = "idle" | "running" | "paused";

interface GroupTimerProps {
  groupId: string;
  onSessionIdChange?: (sessionId: string | null) => void;
}

export default function GroupTimer({
  groupId,
  onSessionIdChange,
}: GroupTimerProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const stopwatch = useStopwatch({ autoStart: false });

  const elapsedSeconds = useMemo(
    () => stopwatch.hours * 3600 + stopwatch.minutes * 60 + stopwatch.seconds,
    [stopwatch.hours, stopwatch.minutes, stopwatch.seconds]
  );

  const startGroupTimerMutation = useStartGroupTimer(groupId);
  const pauseGroupTimerMutation = usePauseGroupTimer(groupId, sessionId || "");
  const resumeGroupTimerMutation = useResumeGroupTimer(
    groupId,
    sessionId || ""
  );
  const finishGroupTimerMutation = useFinishGroupTimer(
    groupId,
    sessionId || ""
  );

  const handleStart = async () => {
    try {
      setSessionId(null);
      onSessionIdChange?.(null);

      const session = await startGroupTimerMutation.mutateAsync({
        targetSeconds: 3600,
        participationType: "GROUP",
        groupId,
      });
      setSessionId(session.sessionId);
      onSessionIdChange?.(session.sessionId);
      stopwatch.start();
      setStatus("running");
    } catch (error) {
      console.error("그룹 타이머 시작 실패:", error);
    }
  };

  const handlePause = async () => {
    if (!sessionId) return;
    try {
      await pauseGroupTimerMutation.mutateAsync();
      stopwatch.pause();
      setStatus("paused");
    } catch (error) {
      console.error("그룹 타이머 일시정지 실패:", error);
    }
  };

  const handleResume = async () => {
    if (!sessionId) return;
    try {
      await resumeGroupTimerMutation.mutateAsync();
      stopwatch.start();
      setStatus("running");
    } catch (error) {
      console.error("그룹 타이머 재개 실패:", error);
    }
  };

  const handleStop = async () => {
    if (!sessionId) return;
    try {
      await finishGroupTimerMutation.mutateAsync();
      setTotalSeconds((prev) => prev + elapsedSeconds);
      stopwatch.reset(undefined, false);
      setStatus("idle");
    } catch (error) {
      console.error("그룹 타이머 종료 실패:", error);
    }
  };

  return (
    <div className="w-full flex items-center gap-5">
      <div className="w-[346px] flex flex-col justify-center items-center rounded-2xl py-2 bg-gray-100">
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
          disabled={startGroupTimerMutation.isPending}
          className="bg-gray-600 px-8 py-1.5 text-white rounded-lg text-body2-14SB flex justify-center items-center gap-2 disabled:opacity-50"
        >
          <Icon Svg={StartIcon} size={24} className="text-white" />
          {startGroupTimerMutation.isPending ? "..." : "시작"}
        </button>
      )}

      {status === "running" && (
        <div className="flex flex-col gap-2">
          <button
            onClick={handlePause}
            disabled={pauseGroupTimerMutation.isPending}
            className="bg-gray-600 px-8 text-body2-14SB text-white rounded-lg py-1.5 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            <Icon Svg={Pause} size={24} className="text-white" />
            {pauseGroupTimerMutation.isPending ? "..." : "휴식"}
          </button>
          <button
            onClick={handleStop}
            disabled={finishGroupTimerMutation.isPending}
            className="px-8 text-body2-14SB bg-red-400 text-white rounded-lg py-1.5 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            <Icon Svg={Stop} size={24} className="text-white" />
            {finishGroupTimerMutation.isPending ? "..." : "종료"}
          </button>
        </div>
      )}

      {status === "paused" && (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleResume}
            disabled={resumeGroupTimerMutation.isPending}
            className="bg-gray-600 px-8 text-body2-14SB text-white rounded-lg py-1.5 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            <Icon Svg={StartIcon} size={24} className="text-white" />
            {resumeGroupTimerMutation.isPending ? "..." : "시작"}
          </button>
          <button
            onClick={handleStop}
            disabled={finishGroupTimerMutation.isPending}
            className="px-8 text-body2-14SB bg-red-400 text-white rounded-lg py-1.5 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            <Icon Svg={Stop} size={24} className="text-white" />
            {finishGroupTimerMutation.isPending ? "..." : "종료"}
          </button>
        </div>
      )}
    </div>
  );
}
