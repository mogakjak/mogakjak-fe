const TIMER_BASE = "/api/timers";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${TIMER_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err?.message || err?.error || message;
    } catch {
      // noop – fallback to default message
    }
    throw new Error(message);
  }

  const json = (await res.json().catch(() => undefined)) as
    | { statusCode?: number; message?: string; data?: unknown }
    | undefined;

  if (json && typeof json.statusCode === "number") {
    const code = json.statusCode;
    const isSuccess = code === 0 || (code >= 200 && code < 300);
    if (!isSuccess) {
      throw new Error(json?.message ?? `HTTP ${code}`);
    }
    return json?.data as T;
  }

  return json as T;
}

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
};

export const startPomodoro = (payload: StartPomodoroPayload) =>
  request<PomodoroSession>("/start/pomodoro", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const pauseTimer = (sessionId: string) =>
  request<PomodoroSession>(`/pause/${sessionId}`, {
    method: "POST",
  });

export const resumeTimer = (sessionId: string) =>
  request<PomodoroSession>(`/resume/${sessionId}`, {
    method: "POST",
  });

export const finishTimer = (sessionId: string) =>
  request<PomodoroSession>(`/finish/${sessionId}`, {
    method: "POST",
  });

export type StartTimerPayload = {
  todoId: string;
  targetSeconds: number;
};

export type StartStopwatchPayload = {
  todoId: string;
};

export const startTimer = (payload: StartTimerPayload) =>
  request<PomodoroSession>("/start/timer", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const startStopwatch = (payload: StartStopwatchPayload) =>
  request<PomodoroSession>("/start/stopwatch", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const finishActiveTimer = () =>
  request<PomodoroSession>("/finish/active", {
    method: "POST",
  });

export const nextPomodoro = (sessionId: string) =>
  request<PomodoroSession>(`/next/pomodoro/${sessionId}`, {
    method: "POST",
  });

//// 그룹 타이머

export type StartGroupTimerPayload = {
  targetSeconds: number;
};

export const startGroupTimer = (
  groupId: string,
  payload: StartGroupTimerPayload
) =>
  request<PomodoroSession>(`/groups/${groupId}/start/timer`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const resumeGroupTimer = (groupId: string, sessionId: string) =>
  request<PomodoroSession>(`/groups/${groupId}/resume/${sessionId}`, {
    method: "POST",
  });

export const pauseGroupTimer = (groupId: string, sessionId: string) =>
  request<PomodoroSession>(`/groups/${groupId}/pause/${sessionId}`, {
    method: "POST",
  });

export const finishGroupTimer = (groupId: string, sessionId: string) =>
  request<PomodoroSession>(`/groups/${groupId}/finish/${sessionId}`, {
    method: "POST",
  });
