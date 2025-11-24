import { request } from "../request";

const TIMER_BASE = "/api/timers";

export type PomodoroSession = {
  sessionId: string;
  mode: "TIMER" | "STOPWATCH" | "POMODORO";
  status: "FINISHED";
  startedAt: string;
  pausedAt: string;
  endedAt: string;
  targetDuration: number;
  totalDuration: number;
  progressRate: number;
  todo: {
    id: string;
    task: string;
    targetTimeInSeconds: number;
  };
  pomodoroInfo: {
    focusDuration: number;
    breakDuration: number;
    repeatCount: number;
    phaseType: "FOCUS" | "BREAK" | "NORMAL";
    round: number;
    phaseStartedAt: string;
  };
};

export type StartPomodoroPayload = {
  todoId: string;
  focusSeconds: number;
  breakSeconds: number;
  repeatCount: number;
  participationType?: "INDIVIDUAL" | "GROUP";
  groupId?: string;
  isTaskPublic?: boolean;
  isTimerPublic?: boolean;
};

export const startPomodoro = (payload: StartPomodoroPayload) =>
  request<PomodoroSession>(TIMER_BASE, "/start/pomodoro", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const pauseTimer = (sessionId: string) =>
  request<PomodoroSession>(TIMER_BASE, `/pause/${sessionId}`, {
    method: "POST",
  });

export const resumeTimer = (sessionId: string) =>
  request<PomodoroSession>(TIMER_BASE, `/resume/${sessionId}`, {
    method: "POST",
  });

export const finishTimer = (sessionId: string) =>
  request<PomodoroSession>(TIMER_BASE, `/finish/${sessionId}`, {
    method: "POST",
  });

export type StartTimerPayload = {
  todoId: string;
  targetSeconds: number;
  participationType?: "INDIVIDUAL" | "GROUP";
  groupId?: string;
  isTaskPublic?: boolean;
  isTimerPublic?: boolean;
};

export type StartStopwatchPayload = {
  todoId: string;
  participationType?: "INDIVIDUAL" | "GROUP";
  groupId?: string;
  isTaskPublic?: boolean;
  isTimerPublic?: boolean;
};

export const startTimer = (payload: StartTimerPayload) =>
  request<PomodoroSession>(TIMER_BASE, "/start/timer", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const startStopwatch = (payload: StartStopwatchPayload) =>
  request<PomodoroSession>(TIMER_BASE, "/start/stopwatch", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const finishActiveTimer = () =>
  request<PomodoroSession>(TIMER_BASE, "/finish/active", {
    method: "POST",
  });

export const nextPomodoro = (sessionId: string) =>
  request<PomodoroSession>(TIMER_BASE, `/next/pomodoro/${sessionId}`, {
    method: "POST",
  });

// 개인 타이머 공개/비공개 설정
export type PersonalTimerVisibilityRequest = {
  isTaskPublic?: boolean;
  isTimerPublic?: boolean;
};

export const updatePersonalTimerVisibility = (
  sessionId: string,
  payload: PersonalTimerVisibilityRequest
) =>
  request<void>(TIMER_BASE, `/${sessionId}/visibility`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

//// 그룹 타이머

export type StartGroupTimerPayload = {
  targetSeconds: number;
  participationType?: "INDIVIDUAL" | "GROUP";
  groupId?: string;
};

export const startGroupTimer = (
  groupId: string,
  payload: StartGroupTimerPayload
) =>
  request<PomodoroSession>(TIMER_BASE, `/groups/${groupId}/start/timer`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const resumeGroupTimer = (groupId: string, sessionId: string) =>
  request<PomodoroSession>(TIMER_BASE, `/groups/${groupId}/resume/${sessionId}`, {
    method: "POST",
  });

export const pauseGroupTimer = (groupId: string, sessionId: string) =>
  request<PomodoroSession>(TIMER_BASE, `/groups/${groupId}/pause/${sessionId}`, {
    method: "POST",
  });

export const finishGroupTimer = (groupId: string, sessionId: string) =>
  request<PomodoroSession>(TIMER_BASE, `/groups/${groupId}/finish/${sessionId}`, {
    method: "POST",
  });
