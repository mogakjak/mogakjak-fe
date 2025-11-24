"use client";

import type { CheerNotification } from "@/app/_types/groups";
import { useWebSocketWithUserId } from "../useWebSocketWithUserId";

type UseCheerNotificationOptions = {
  enabled?: boolean;
  onNotification?: (notification: CheerNotification) => void;
};

export function useCheerNotification({
  enabled = true,
  onNotification,
}: UseCheerNotificationOptions) {
  return useWebSocketWithUserId<CheerNotification>({
    enabled,
    onMessage: onNotification,
    getDestination: (userId) => `/topic/user/${userId}/cheer`,
  });
}
