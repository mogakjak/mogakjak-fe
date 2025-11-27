"use client";

import { useWebSocket } from "../useWebSocket";

export type UserActiveStatusEvent = {
  userId: string;
  isActive: boolean;
  lastActivityAt?: string | null; // 마지막 활동 시간 (ISO 8601 형식)
};

type UseMateActiveStatusOptions = {
  enabled?: boolean;
  onStatusChange?: (event: UserActiveStatusEvent) => void;
};

export function useMateActiveStatus({
  enabled = true,
  onStatusChange,
}: UseMateActiveStatusOptions) {
  const { isConnected } = useWebSocket<UserActiveStatusEvent>({
    enabled,
    destination: "/topic/mates/active-status",
    onMessage: onStatusChange,
  });

  return { isConnected };
}

