export const timerKeys = {
  all: ["timers"] as const,
  pomodoro: (todoId?: string) =>
    [...timerKeys.all, "pomodoro", todoId ?? ""] as const,
  current: () => [...timerKeys.all, "current"] as const,
  state: () => [...timerKeys.all, "state"] as const,
  group: (groupId: string) => [...timerKeys.all, "group", groupId] as const,
  groupSession: (groupId: string, sessionId: string) =>
    [...timerKeys.all, "group", groupId, "session", sessionId] as const,
};
