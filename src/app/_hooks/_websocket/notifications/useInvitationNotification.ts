"use client";

import type { PendingInvitation } from "@/app/_types/invitations";
import { useWebSocketWithUserId } from "../useWebSocketWithUserId";

export type InvitationNotification = PendingInvitation & {
  message: string;
};

type UseInvitationNotificationOptions = {
  enabled?: boolean;
  onNotification?: (notification: InvitationNotification) => void;
  connectDelay?: number;
  waitForLoad?: boolean;
};

export function useInvitationNotification({
  enabled = true,
  onNotification,
  connectDelay,
  waitForLoad,
}: UseInvitationNotificationOptions) {
  return useWebSocketWithUserId<InvitationNotification>({
    enabled,
    onMessage: onNotification,
    getDestination: (userId) => `/topic/user/${userId}/invitation`,
    connectDelay,
    waitForLoad,
  });
}

