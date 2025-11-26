"use client";

import type { PokeNotification } from "@/app/_types/groups";
import { useWebSocketWithUserId } from "../useWebSocketWithUserId";

type UsePokeNotificationOptions = {
  enabled?: boolean;
  onNotification?: (notification: PokeNotification) => void;
  connectDelay?: number;
  waitForLoad?: boolean;
};

export function usePokeNotification({
  enabled = true,
  onNotification,
  connectDelay,
  waitForLoad,
}: UsePokeNotificationOptions) {
  return useWebSocketWithUserId<PokeNotification>({
    enabled,
    onMessage: onNotification,
    getDestination: (userId) => `/topic/user/${userId}/poke`,
    connectDelay,
    waitForLoad,
  });
}
