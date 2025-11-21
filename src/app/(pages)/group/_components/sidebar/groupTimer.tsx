"use client";

import { useMemo, useState, useEffect } from "react";
import { useStopwatch } from "react-timer-hook";
import Icon from "../../../../_components/common/Icons";
import {
  useStartGroupTimer,
  usePauseGroupTimer,
  useResumeGroupTimer,
  useFinishGroupTimer,
} from "@/app/_hooks/timers";
import { useGroupTimer, GroupTimerEvent } from "@/app/_hooks/useGroupTimer";

// 이미지 관리
import StartIcon from "/Icons/start.svg";
import Pause from "/Icons/pause.svg";
import Stop from "/Icons/stop.svg";
import { formatTime } from "@/app/_utils/formatTime";

type Status = "idle" | "running" | "paused";

interface GroupTimerProps {
  groupId: string;
  initialAccumulatedDuration?: number; // 초기 누적 시간 (초 단위)
  onSessionIdChange?: (sessionId: string | null) => void;
  onStatusChange?: (status: Status) => void;
}

export default function GroupTimer({
  groupId,
  initialAccumulatedDuration = 0,
  onSessionIdChange,
  onStatusChange,
}: GroupTimerProps) {
  const [status, setStatus] = useState<Status>("idle");

  // status 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentSessionTotalSeconds, setCurrentSessionTotalSeconds] =
    useState(0); // 현재 세션의 총 시간
  const [accumulatedDuration, setAccumulatedDuration] = useState(
    initialAccumulatedDuration
  ); // 서버에서 받은 그룹 누적 시간
  const [startedAt, setStartedAt] = useState<number | null>(null); // 타이머 시작 시점 (로컬 시간, ms)
  const [baseSeconds, setBaseSeconds] = useState(0); // 서버에서 받은 기준 시간 (초)

  const stopwatch = useStopwatch({ autoStart: false });

  // 초기 누적 시간이 변경되면 업데이트 (그룹 상세 정보가 로드된 후)
  useEffect(() => {
    setAccumulatedDuration(initialAccumulatedDuration);
  }, [initialAccumulatedDuration]);

  // 서버 시간과 동기화된 경과 시간 계산 (현재 세션의 경과 시간)
  const elapsedSeconds = useMemo(() => {
    // RUNNING 상태이고 세션이 있으면 실시간으로 증가
    if (status === "running" && sessionId && startedAt !== null) {
      const now = Date.now();
      const elapsedMs = now - startedAt;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      return baseSeconds + elapsedSec;
    }
    // PAUSED 상태이거나 세션이 있으면 서버에서 받은 currentSessionTotalSeconds 사용
    if (sessionId) {
      return currentSessionTotalSeconds;
    }
    // 로컬 stopwatch 시간 (시작 전)
    return stopwatch.hours * 3600 + stopwatch.minutes * 60 + stopwatch.seconds;
  }, [
    status,
    sessionId,
    startedAt,
    baseSeconds,
    currentSessionTotalSeconds,
    stopwatch.hours,
    stopwatch.minutes,
    stopwatch.seconds,
  ]);

  // 타이머가 running 상태일 때 1초마다 화면 업데이트를 위한 state
  const [, setTick] = useState(0);

  useEffect(() => {
    if (status === "running" && sessionId && startedAt !== null) {
      const interval = setInterval(() => {
        setTick((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, sessionId, startedAt]);

  // 전체 누적 시간 (서버에서 받은 누적 시간 + 현재 세션 시간)
  const totalSeconds = useMemo(() => {
    return accumulatedDuration + elapsedSeconds;
  }, [accumulatedDuration, elapsedSeconds]);

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

  // 그룹 타이머 WebSocket 이벤트 구독
  useGroupTimer({
    groupId,
    enabled: true,
    onEvent: (event: GroupTimerEvent) => {
      console.log("[GroupTimer] 이벤트 수신:", event);

      switch (event.eventType) {
        case "START":
          // 다른 사용자가 시작한 타이머도 처리
          setSessionId(event.sessionId);
          onSessionIdChange?.(event.sessionId);
          const startTotalDuration = event.totalDuration || 0;
          setCurrentSessionTotalSeconds(startTotalDuration);
          setBaseSeconds(startTotalDuration);
          setStartedAt(Date.now());
          // 서버에서 받은 누적 시간 설정
          if (event.accumulatedDuration !== undefined) {
            setAccumulatedDuration(event.accumulatedDuration);
          }
          stopwatch.start();
          setStatus("running");
          break;

        case "PAUSE":
          // 세션 ID가 일치하거나 현재 세션이 없으면 업데이트
          if (!sessionId || event.sessionId === sessionId) {
            setSessionId(event.sessionId);
            stopwatch.pause();
            setStatus("paused");
            setStartedAt(null); // 일시정지 시 startedAt 초기화
            // 서버에서 전달된 totalDuration으로 업데이트 (현재 세션의 총 시간)
            if (event.totalDuration !== undefined) {
              setCurrentSessionTotalSeconds(event.totalDuration);
              setBaseSeconds(event.totalDuration);
            }
            // 서버에서 받은 누적 시간 업데이트
            if (event.accumulatedDuration !== undefined) {
              setAccumulatedDuration(event.accumulatedDuration);
            }
          }
          break;

        case "RESUME":
          // 세션 ID가 일치하거나 현재 세션이 없으면 업데이트
          if (!sessionId || event.sessionId === sessionId) {
            setSessionId(event.sessionId);
            stopwatch.start();
            setStatus("running");
            if (event.totalDuration !== undefined) {
              setCurrentSessionTotalSeconds(event.totalDuration);
              setBaseSeconds(event.totalDuration);
              setStartedAt(Date.now()); // 재개 시점 기록
            }
            // 서버에서 받은 누적 시간 업데이트
            if (event.accumulatedDuration !== undefined) {
              setAccumulatedDuration(event.accumulatedDuration);
            }
          }
          break;

        case "FINISH":
          // 세션 ID가 일치하면 종료
          if (event.sessionId === sessionId) {
            // 서버에서 받은 누적 시간으로 업데이트 (서버에서 이미 더해진 값)
            if (event.accumulatedDuration !== undefined) {
              setAccumulatedDuration(event.accumulatedDuration);
            }
            setCurrentSessionTotalSeconds(0);
            setBaseSeconds(0);
            setStartedAt(null);
            stopwatch.reset(undefined, false);
            setStatus("idle");
            setSessionId(null);
            onSessionIdChange?.(null);
          }
          break;

        case "SYNC":
          // 10초마다 서버 시간 동기화
          if (event.sessionId && event.status === "RUNNING") {
            // 현재 세션이 없거나 일치하는 세션이면 업데이트
            setSessionId((currentSessionId) => {
              if (!currentSessionId || event.sessionId === currentSessionId) {
                setStatus("running");

                if (event.totalDuration !== undefined) {
                  // 서버의 totalDuration으로 동기화 (현재 세션의 총 시간)
                  // 서버 시간을 기준으로 다시 시작
                  setBaseSeconds(event.totalDuration);
                  setStartedAt(Date.now());
                  setCurrentSessionTotalSeconds(event.totalDuration);

                  // 서버에서 받은 누적 시간 업데이트
                  if (event.accumulatedDuration !== undefined) {
                    setAccumulatedDuration(event.accumulatedDuration);
                  }

                  // stopwatch 시작 (이미 실행 중이어도 안전)
                  stopwatch.start();
                }

                return event.sessionId;
              }
              return currentSessionId;
            });
          }
          break;
      }
    },
  });

  const handleStart = async () => {
    try {
      setSessionId(null);
      onSessionIdChange?.(null);

      await startGroupTimerMutation.mutateAsync({
        targetSeconds: 3600,
        participationType: "GROUP",
        groupId,
      });
      // WebSocket 이벤트로 상태가 업데이트됨
    } catch (error) {
      console.error("그룹 타이머 시작 실패:", error);
    }
  };

  const handlePause = async () => {
    if (!sessionId) return;
    try {
      await pauseGroupTimerMutation.mutateAsync();
      // WebSocket 이벤트로 상태가 업데이트됨
    } catch (error) {
      console.error("그룹 타이머 일시정지 실패:", error);
    }
  };

  const handleResume = async () => {
    if (!sessionId) return;
    try {
      await resumeGroupTimerMutation.mutateAsync();
      // WebSocket 이벤트로 상태가 업데이트됨
    } catch (error) {
      console.error("그룹 타이머 재개 실패:", error);
    }
  };

  const handleStop = async () => {
    if (!sessionId) return;
    try {
      await finishGroupTimerMutation.mutateAsync();
      // WebSocket 이벤트로 상태가 업데이트됨
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
