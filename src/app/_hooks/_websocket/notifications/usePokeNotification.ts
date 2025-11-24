"use client";

import type { PokeNotification } from "@/app/_types/groups";
import { useWebSocketWithUserId } from "../useWebSocketWithUserId";

type UsePokeNotificationOptions = {
  enabled?: boolean;
  onNotification?: (notification: PokeNotification) => void;
};

export function usePokeNotification({
  enabled = true,
  onNotification,
}: UsePokeNotificationOptions) {
  return useWebSocketWithUserId<PokeNotification>({
    enabled,
    onMessage: onNotification,
    getDestination: (userId) => `/topic/user/${userId}/poke`,
  });
}
