"use client";

import type { CheerNotification } from "@/app/_types/groups";
import { useWebSocketWithUserId } from "../useWebSocketWithUserId";

type UseCheerNotificationOptions = {
  enabled?: boolean;
  onNotification?: (notification: CheerNotification) => void;
  connectDelay?: number;
  waitForLoad?: boolean;
};

export function useCheerNotification({
  enabled = true,
  onNotification,
  connectDelay,
  waitForLoad,
}: UseCheerNotificationOptions) {
  return useWebSocketWithUserId<CheerNotification>({
    enabled,
    onMessage: onNotification,
    getDestination: (userId) => `/topic/user/${userId}/cheer`,
    connectDelay,
    waitForLoad,
  });
}
