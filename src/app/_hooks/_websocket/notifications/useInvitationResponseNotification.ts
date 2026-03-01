"use client";

import type { InvitationResponseNotification } from "@/app/_types/invitations";
import { useWebSocketWithUserId } from "../useWebSocketWithUserId";

type UseInvitationResponseNotificationOptions = {
  enabled?: boolean;
  onNotification?: (notification: InvitationResponseNotification) => void;
  connectDelay?: number;
  waitForLoad?: boolean;
};

export function useInvitationResponseNotification({
  enabled = true,
  onNotification,
  connectDelay,
  waitForLoad,
}: UseInvitationResponseNotificationOptions) {
  return useWebSocketWithUserId<InvitationResponseNotification>({
    enabled,
    onMessage: onNotification,
    getDestination: (userId) => `/topic/user/${userId}/invitation-response`,
    connectDelay,
    waitForLoad,
  });
}

