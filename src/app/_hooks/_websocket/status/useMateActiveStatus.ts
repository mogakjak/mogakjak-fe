"use client";

import { useWebSocket } from "../useWebSocket";

export type UserActiveStatusEvent = {
  userId: string;
  isActive: boolean;
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

