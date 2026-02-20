"use client";

import { useState } from "react";
import { useWebSocket } from "../useWebSocket";

export type FocusNotificationMessage = {
  groupId: string;
  message: string;
  groupName: string;
};

type UseFocusNotificationOptions = {
  groupId: string;
  enabled?: boolean;
  onNotification?: (message: FocusNotificationMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

export function useFocusNotification({
  groupId,
  enabled = true,
  onNotification,
  onConnect,
  onDisconnect,
}: UseFocusNotificationOptions) {
  const [lastNotification, setLastNotification] =
    useState<FocusNotificationMessage | null>(null);

  const { isConnected, connect, disconnect } =
    useWebSocket<FocusNotificationMessage>({
      enabled: enabled && !!groupId,
      destination: groupId ? `/topic/group/${groupId}/notification` : undefined,
      onMessage: (message) => {
        setLastNotification(message);
        onNotification?.(message);
      },
      onConnect,
      onDisconnect,
    });

  return {
    isConnected,
    lastNotification,
    reconnect: connect,
    disconnect,
  };
}
