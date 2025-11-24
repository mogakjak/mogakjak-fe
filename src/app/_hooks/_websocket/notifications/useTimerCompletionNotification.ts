"use client";

import { useWebSocketWithUserId } from "../useWebSocketWithUserId";

export type TimerCompletionNotification = {
  sessionId: string;
  userId: string;
  groupId?: string;
  mode: "TIMER" | "POMODORO";
  message: string;
  todoTitle?: string;
};

type UseTimerCompletionNotificationOptions = {
  enabled?: boolean;
  onNotification?: (notification: TimerCompletionNotification) => void;
};

export function useTimerCompletionNotification({
  enabled = true,
  onNotification,
}: UseTimerCompletionNotificationOptions) {
  return useWebSocketWithUserId<TimerCompletionNotification>({
    enabled,
    onMessage: onNotification,
    getDestination: (userId) => `/topic/user/${userId}/timer-completion`,
  });
}
