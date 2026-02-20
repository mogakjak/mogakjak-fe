"use client";

import { useState, useCallback } from "react";
import { useWebSocketWithUserId } from "../useWebSocketWithUserId";

export type FocusNotificationMessage = {
  groupId: string;
  message: string;
  groupName: string;
};

type UseFocusNotificationOptions = {
  groupId: string;
  enabled?: boolean;
  onNotification?: (message: FocusNotificationMessage) => void;
};

/**
 * 그룹 페이지에서 집중 체크 알림 수신 (유저 토픽 구독 후 groupId로 필터)
 * 백엔드가 /topic/user/{userId}/focus-notification 으로만 전송하므로 동일 토픽 구독
 */
export function useFocusNotification({
  groupId,
  enabled = true,
  onNotification,
}: UseFocusNotificationOptions) {
  const [lastNotification, setLastNotification] =
    useState<FocusNotificationMessage | null>(null);

  const handleMessage = useCallback(
    (message: FocusNotificationMessage) => {
      if (message.groupId !== groupId) return;
      setLastNotification(message);
      onNotification?.(message);
    },
    [groupId, onNotification]
  );

  const { isConnected, connect, disconnect } =
    useWebSocketWithUserId<FocusNotificationMessage>({
      enabled: enabled && !!groupId,
      getDestination: (userId) => `/topic/user/${userId}/focus-notification`,
      onMessage: handleMessage,
    });

  return {
    isConnected,
    lastNotification,
    reconnect: connect,
    disconnect,
  };
}
