"use client";

import { useMemo, useState, useEffect} from "react";
import Icon from "../../../../_components/common/Icons";
import { useStartGroupTimer } from "@/app/_hooks/timers/useStartGroupTimer";
import { usePauseGroupTimer } from "@/app/_hooks/timers/usePauseGroupTimer";
import { useResumeGroupTimer } from "@/app/_hooks/timers/useResumeGroupTimer";
import { useFinishGroupTimer } from "@/app/_hooks/timers/useFinishGroupTimer";
import {
  useGroupTimer,
  GroupTimerEvent,
} from "@/app/_hooks/_websocket/timer/useGroupTimer";
import type { GroupMemberStatus } from "@/app/_hooks/_websocket/status/useGroupMemberStatus";
import AlertModal from "@/app/_components/common/timer/alertModal";

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
  memberStatuses?: Map<string, GroupMemberStatus>; // 그룹 멤버 상태
}

export default function GroupTimer({
  groupId,
  initialAccumulatedDuration = 0,
  onSessionIdChange,
  onStatusChange,
  memberStatuses,
}: GroupTimerProps) {
  const [status, setStatus] = useState<Status>("idle");

  // status 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentSessionTotalSeconds, setCurrentSessionTotalSeconds] =
    useState(0); // 현재 세션의 총 시간 (서버에서 받은 값)
  const [clientElapsedSeconds, setClientElapsedSeconds] = useState(0); // 클라이언트에서 추적하는 경과 시간 (1초마다 증가)
  const [serverSyncTime, setServerSyncTime] = useState<number>(Date.now()); // 서버 동기화 시점
  const [accumulatedDuration, setAccumulatedDuration] = useState(
    initialAccumulatedDuration
  ); // 서버에서 받은 그룹 누적 시간
  const [isLimitOpen, setLimitOpen] = useState(false); 
  const [localIdleSeconds, setLocalIdleSeconds] = useState(0);

  // 초기 누적 시간이 변경되면 업데이트 (그룹 상세 정보가 로드된 후)
  useEffect(() => {
    setAccumulatedDuration(initialAccumulatedDuration);
  }, [initialAccumulatedDuration]);

  // 서버에서 받은 시간이 변경되면 클라이언트 경과 시간 동기화
  useEffect(() => {
    if (status === "running" && sessionId) {
      setClientElapsedSeconds(currentSessionTotalSeconds);
      setServerSyncTime(Date.now());
    }
  }, [currentSessionTotalSeconds, status, sessionId]);

  // running 상태일 때 1초마다 클라이언트 경과 시간 증가
  useEffect(() => {
    if (status !== "running" || !sessionId) {
      return;
    }

    const interval = setInterval(() => {
      setClientElapsedSeconds(() => {
        // 서버에서 받은 시간 + 경과 시간 (초 단위)
        const elapsedSeconds = Math.floor((Date.now() - serverSyncTime) / 1000);
        return currentSessionTotalSeconds + elapsedSeconds;
      });
    }, 1000); // 1초마다 업데이트

    return () => clearInterval(interval);
  }, [status, sessionId, currentSessionTotalSeconds, serverSyncTime]);

  // 서버 시간과 동기화된 경과 시간 계산 (현재 세션의 경과 시간)
  const elapsedSeconds = useMemo(() => {
    // RUNNING 상태이고 세션이 있으면 클라이언트에서 증가하는 시간 사용
    if (status === "running" && sessionId) {
      return clientElapsedSeconds;
    }
    // PAUSED 상태이거나 세션이 있으면 서버에서 받은 정적 시간 사용
    if (sessionId) {
      return currentSessionTotalSeconds;
    }
    // 로컬 idle 시간 (시작 전)
    return localIdleSeconds;
  }, [
    status,
    sessionId,
    currentSessionTotalSeconds,
    clientElapsedSeconds,
    localIdleSeconds,
  ]);

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
      switch (event.eventType) {
        case "START":
          // 다른 사용자가 시작한 타이머도 처리
          setSessionId(event.sessionId ?? null);
          onSessionIdChange?.(event.sessionId ?? null);
          const startTotalDuration = event.totalDuration || 0;
          setCurrentSessionTotalSeconds(startTotalDuration);
          setClientElapsedSeconds(startTotalDuration);
          setServerSyncTime(Date.now());
          // 서버에서 받은 누적 시간 설정
          if (event.accumulatedDuration !== undefined) {
            setAccumulatedDuration(event.accumulatedDuration);
          }
          setStatus("running");
          break;

        case "PAUSE":
          // 세션 ID가 일치하거나 현재 세션이 없으면 업데이트
          if (!sessionId || event.sessionId === sessionId) {
            setSessionId(event.sessionId ?? null);
            setStatus("paused");
            // 서버에서 전달된 totalDuration으로 업데이트 (현재 세션의 총 시간)
            if (event.totalDuration !== undefined) {
              setCurrentSessionTotalSeconds(event.totalDuration);
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
            setSessionId(event.sessionId ?? null);
            setStatus("running");
            if (event.totalDuration !== undefined) {
              const resumeTotalDuration = event.totalDuration;
              setCurrentSessionTotalSeconds(resumeTotalDuration);
              setClientElapsedSeconds(resumeTotalDuration);
              setServerSyncTime(Date.now());
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
            setClientElapsedSeconds(0);
            setLocalIdleSeconds(0);
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
                  const syncTotalDuration = event.totalDuration;
                  setCurrentSessionTotalSeconds(syncTotalDuration);
                  setClientElapsedSeconds(syncTotalDuration);
                  setServerSyncTime(Date.now());

                  // 서버에서 받은 누적 시간 업데이트
                  if (event.accumulatedDuration !== undefined) {
                    setAccumulatedDuration(event.accumulatedDuration);
                  }
                }

                return event.sessionId ?? null;
              }
              return currentSessionId;
            });
          }
          break;
      }
    },
  });

  // NOT_PARTICIPATING이 아닌 멤버 수 계산
  const activeParticipantCount = useMemo(() => {
    if (!memberStatuses) return 0;
    let count = 0;
    memberStatuses.forEach((member) => {
      if (member.participationStatus !== "NOT_PARTICIPATING") {
        count++;
      }
    });
    return count;
  }, [memberStatuses]);

  // 타이머 실행 중 참여자가 1명 이하가 되면 자동 종료
  useEffect(() => {
    if (status === "running" && sessionId && activeParticipantCount <= 1) {
      // 자동 종료
      finishGroupTimerMutation.mutateAsync().catch((error) => {
        console.error("그룹 타이머 자동 종료 실패:", error);
      });
    }
  }, [status, sessionId, activeParticipantCount, finishGroupTimerMutation]);

  const handleStart = async () => {
    // 참여자가 2명 미만이면 AlertModal 띄우고 타이머 시작 막기
    if (activeParticipantCount < 2) {
      setLimitOpen(true);
      return; // 타이머 시작을 완전히 막음
    }

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
            aria-label="그룹 타이머 시작"
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
              aria-label="그룹 타이머 휴식"
              className="bg-gray-600 px-8 text-body2-14SB text-white rounded-lg py-1.5 flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <Icon Svg={Pause} size={24} className="text-white" />
              {pauseGroupTimerMutation.isPending ? "..." : "휴식"}
            </button>
            <button
              onClick={handleStop}
              disabled={finishGroupTimerMutation.isPending}
              aria-label="그룹 타이머 종료"
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
              aria-label="그룹 타이머 재시작"
              className="bg-gray-600 px-8 text-body2-14SB text-white rounded-lg py-1.5 flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <Icon Svg={StartIcon} size={24} className="text-white" />
              {resumeGroupTimerMutation.isPending ? "..." : "시작"}
            </button>
            <button
              onClick={handleStop}
              disabled={finishGroupTimerMutation.isPending}
              aria-label="그룹 타이머 종료"
              className="px-8 text-body2-14SB bg-red-400 text-white rounded-lg py-1.5 flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <Icon Svg={Stop} size={24} className="text-white" />
              {finishGroupTimerMutation.isPending ? "..." : "종료"}
            </button>
          </div>
        )}
      </div>

      <AlertModal
        isOpen={isLimitOpen}
        onClose={() => setLimitOpen(false)}
        type="groupTimerLimit"
      />
    </div>
  );
}
