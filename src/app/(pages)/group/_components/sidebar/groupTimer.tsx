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
import VisibilityToggle from "./visibilityButton";
import { updateGroupTimerVisibility } from "@/app/api/groups/api";
import { useQueryClient } from "@tanstack/react-query";
import { groupKeys } from "@/app/api/groups/keys";
import { useAuthState } from "@/app/api/auth/useAuthState";
import { getUserIdFromToken } from "@/app/_lib/getJwtExp";

// 이미지 관리
import StartIcon from "/Icons/start.svg";
import Pause from "/Icons/pause.svg";
import Stop from "/Icons/stop.svg";
import { formatTime } from "@/app/_utils/formatTime";

type Status = "idle" | "running" | "paused";

interface GroupTimerProps {
  groupId: string;
  initialAccumulatedDuration?: number; // 초기 누적 시간 (초 단위)
  initialIsTimerPublic?: boolean; // 초기 공개 여부
  onSessionIdChange?: (sessionId: string | null) => void;
}

export default function GroupTimer({
  groupId,
  initialAccumulatedDuration = 0,
  initialIsTimerPublic = true,
  onSessionIdChange,
}: GroupTimerProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentSessionTotalSeconds, setCurrentSessionTotalSeconds] = useState(0); // 현재 세션의 총 시간
  const [accumulatedDuration, setAccumulatedDuration] = useState(initialAccumulatedDuration); // 서버에서 받은 그룹 누적 시간
  const [isTimerPublic, setIsTimerPublic] = useState(initialIsTimerPublic); // 그룹 타이머 공개 여부
  const [targetDuration, setTargetDuration] = useState<number | null>(null);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0); // 서버와 클라이언트 시간 차이
  const [startedByUserId, setStartedByUserId] = useState<string | null>(null); // 타이머를 시작한 사용자 ID
  const queryClient = useQueryClient();
  const { token } = useAuthState();

  // 현재 사용자 ID
  const currentUserId = useMemo(() => {
    return getUserIdFromToken(token);
  }, [token]);

  const stopwatch = useStopwatch({ autoStart: false });

  // 초기 누적 시간이 변경되면 업데이트 (그룹 상세 정보가 로드된 후)
  useEffect(() => {
    setAccumulatedDuration(initialAccumulatedDuration);
  }, [initialAccumulatedDuration]);

  // 초기 공개 여부가 변경되면 업데이트
  useEffect(() => {
    setIsTimerPublic(initialIsTimerPublic);
  }, [initialIsTimerPublic]);

  // 서버 시간과 동기화된 경과 시간 계산 (현재 세션의 경과 시간)
  const elapsedSeconds = useMemo(() => {
    // RUNNING 상태이고 세션이 있으면 서버의 totalDuration 사용
    // SYNC 이벤트로 10초마다 업데이트됨
    if (status === "running" && sessionId) {
      return currentSessionTotalSeconds;
    }
    // PAUSED 상태이거나 세션이 있으면 currentSessionTotalSeconds 사용
    if (sessionId) {
      return currentSessionTotalSeconds;
    }
    // 로컬 stopwatch 시간 (시작 전)
    return stopwatch.hours * 3600 + stopwatch.minutes * 60 + stopwatch.seconds;
  }, [status, sessionId, currentSessionTotalSeconds, stopwatch.hours, stopwatch.minutes, stopwatch.seconds]);
  
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
          setCurrentSessionTotalSeconds(event.totalDuration || 0);
          // 서버에서 받은 누적 시간 설정
          if (event.accumulatedDuration !== undefined) {
            setAccumulatedDuration(event.accumulatedDuration);
          }
          // 서버에서 받은 공개 여부 설정
          if (event.isTimerPublic !== undefined) {
            setIsTimerPublic(event.isTimerPublic);
          }
          // 서버 시간과 클라이언트 시간 차이 계산
          if (event.serverTime) {
            const serverTime = new Date(event.serverTime).getTime();
            const clientTime = Date.now();
            setServerTimeOffset(serverTime - clientTime);
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
            // 서버에서 전달된 totalDuration으로 업데이트 (현재 세션의 총 시간)
            if (event.totalDuration !== undefined) {
              setCurrentSessionTotalSeconds(event.totalDuration);
            }
            // 서버에서 받은 누적 시간 업데이트
            if (event.accumulatedDuration !== undefined) {
              setAccumulatedDuration(event.accumulatedDuration);
            }
            // 서버에서 받은 공개 여부 업데이트
            if (event.isTimerPublic !== undefined) {
              setIsTimerPublic(event.isTimerPublic);
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
            }
            // 서버에서 받은 누적 시간 업데이트
            if (event.accumulatedDuration !== undefined) {
              setAccumulatedDuration(event.accumulatedDuration);
            }
            // 서버에서 받은 공개 여부 업데이트
            if (event.isTimerPublic !== undefined) {
              setIsTimerPublic(event.isTimerPublic);
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
            stopwatch.reset(undefined, false);
            setStatus("idle");
            setSessionId(null);
            setStartedByUserId(null);
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
                  setCurrentSessionTotalSeconds(event.totalDuration);
                  
                  // 서버에서 받은 누적 시간 업데이트
                  if (event.accumulatedDuration !== undefined) {
                    setAccumulatedDuration(event.accumulatedDuration);
                  }

                  // 서버에서 받은 공개 여부 업데이트
                  if (event.isTimerPublic !== undefined) {
                    setIsTimerPublic(event.isTimerPublic);
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

        case "VISIBILITY_CHANGE":
          // 공개/비공개 상태 변경
          if (event.isTimerPublic !== undefined) {
            setIsTimerPublic(event.isTimerPublic);
          }
          if (event.accumulatedDuration !== undefined) {
            setAccumulatedDuration(event.accumulatedDuration);
          }
          break;
      }
    },
  });

  const handleStart = async () => {
    try {
      setSessionId(null);
      onSessionIdChange?.(null);
      
      // 현재 사용자가 타이머를 시작한 것으로 기록
      if (currentUserId) {
        setStartedByUserId(currentUserId);
      }

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

  const handleVisibilityChange = async (isPublic: boolean) => {
    try {
      await updateGroupTimerVisibility(groupId, { isTimerPublic: isPublic });
      setIsTimerPublic(isPublic);
      // 그룹 상세 정보 캐시 업데이트
      queryClient.setQueryData<{ isTimerPublic?: boolean } | undefined>(
        groupKeys.detail(groupId),
        (prev) => (prev ? { ...prev, isTimerPublic: isPublic } : prev)
      );
    } catch (error) {
      console.error("그룹 타이머 공개/비공개 설정 실패:", error);
    }
  };

  // 비공개일 때는 시작한 사용자만 볼 수 있음
  const canViewTimer = isTimerPublic || (startedByUserId && currentUserId === startedByUserId);

  // 비공개이고 시작한 사용자가 아니면 타이머를 숨김
  if (!canViewTimer && (status === "running" || status === "paused")) {
    return (
      <div className="w-full flex flex-col gap-3">
        <div className="w-full flex items-center justify-center rounded-2xl py-8 bg-gray-100">
          <p className="text-body1-16M text-gray-400">타이머가 비공개로 설정되어 있습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
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

        {/* 공개/비공개 설정 */}
        {(status === "running" || status === "paused") && (
        <div className="w-full">
          <VisibilityToggle
            isTaskOpen={isTimerPublic}
            setIsTaskOpen={handleVisibilityChange}
          />
        </div>
        )}
      </div>
    </div>
  );
}
