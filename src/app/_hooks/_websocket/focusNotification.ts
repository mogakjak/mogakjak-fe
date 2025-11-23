"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import {
  createWebSocketClient,
  subscribeToTopic,
  type WebSocketClientConfig,
} from "@/app/api/websocket/api";

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

export function useFocusNotification({
  groupId,
  enabled = true,
  onNotification,
}: UseFocusNotificationOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] =
    useState<FocusNotificationMessage | null>(null);
  const clientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNotification = useCallback(
    (message: IMessage) => {
      try {
        const notification: FocusNotificationMessage = JSON.parse(message.body);
        setLastNotification(notification);
        onNotification?.(notification);
      } catch (error) {
        // 메시지 파싱 실패
      }
    },
    [onNotification]
  );

  const connect = useCallback(async () => {
    if (!enabled || !groupId) return;

    // 기존 연결이 있으면 정리
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    try {
      const config: WebSocketClientConfig = {
        debug: (str) => {
          // STOMP 디버그
        },
        onConnect: () => {
          setIsConnected(true);

          // 그룹 알림 구독
          if (clientRef.current) {
            const destination = `/topic/group/${groupId}/notification`;
            subscribeToTopic(
              clientRef.current,
              destination,
              handleNotification
            );
          }
        },
        onStompError: (frame) => {
          setIsConnected(false);
        },
        onWebSocketClose: () => {
          setIsConnected(false);
        },
        onDisconnect: () => {
          setIsConnected(false);
        },
      };

      const { client, connect: connectClient } = await createWebSocketClient(
        config
      );
      clientRef.current = client;
      await connectClient();
    } catch (error) {
      setIsConnected(false);
    }
  }, [enabled, groupId, handleNotification]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setIsConnected(false);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled && groupId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, groupId, connect, disconnect]);

  return {
    isConnected,
    lastNotification,
    reconnect: connect,
    disconnect,
  };
}

