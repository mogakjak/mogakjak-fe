"use client";

import { useWebSocket } from "../useWebSocket";

export type GroupTimerEvent = {
  groupId: string;
  sessionId?: string;
  eventType: "START" | "PAUSE" | "RESUME" | "FINISH" | "SYNC";
  mode?: "TIMER" | "STOPWATCH" | "POMODORO";
  status?: "RUNNING" | "PAUSED" | "FINISHED";
  startedAt?: string;
  pausedAt?: string;
  endedAt?: string;
  targetDuration?: number;
  totalDuration?: number; // 현재 세션의 총 시간
  accumulatedDuration?: number; // 그룹 누적 시간 (여러 세션을 거쳐 쌓인 시간)
  progressRate?: number;
  serverTime: string; // 서버 시간 (동기화용)
};

type UseGroupTimerOptions = {
  groupId: string;
  enabled?: boolean;
  onEvent?: (event: GroupTimerEvent) => void;
  connectDelay?: number;
  waitForLoad?: boolean;
};

export function useGroupTimer({
  groupId,
  enabled = true,
  onEvent,
  connectDelay = 0, // 그룹 페이지는 실시간이 중요하므로 즉시 연결
  waitForLoad = false,
}: UseGroupTimerOptions) {
  return useWebSocket<GroupTimerEvent>({
    enabled: enabled && !!groupId,
    destination: groupId ? `/topic/group/${groupId}/timer` : undefined,
    onMessage: onEvent,
    connectDelay,
    waitForLoad,
  });
}

