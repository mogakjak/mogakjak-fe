"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getUserIdFromToken } from "@/app/_utils/jwt";
import {
  getWebSocketUrl,
  getTokenFromServer,
  subscribeToTopic,
} from "@/app/api/websocket/api";

export type TimerCompletionNotification = {
  sessionId: string;
  userId: string;
  groupId?: string;
  mode: "TIMER" | "POMODORO";
  message: string;
  todoTitle?: string;
};

type UseTimerCompletionNotificationOptions = {
  enabled?: boolean;
  onNotification?: (notification: TimerCompletionNotification) => void;
};

export function useTimerCompletionNotification({
  enabled = true,
  onNotification,
}: UseTimerCompletionNotificationOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  const handleNotification = useCallback((message: IMessage) => {
    try {
      const notification: TimerCompletionNotification = JSON.parse(
        message.body
      );
      onNotificationRef.current?.(notification);
    } catch {
      // 메시지 파싱 실패
    }
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!enabled) return;

    if (clientRef.current) {
      disconnect();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const token = await getTokenFromServer();

    if (!token) {
      return;
    }

    // 토큰에서 userId 추출
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return;
    }

    const connectHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    const wsUrl = getWebSocketUrl();

    const client = new Client({
      webSocketFactory: () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sock = new SockJS(wsUrl) as any;
        return sock;
      },
      connectHeaders,
      debug: () => {
        // 디버그 로그는 필요시에만 활성화
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);

        if (clientRef.current) {
          subscribeToTopic(
            clientRef.current,
            `/topic/user/${userId}/timer-completion`,
            handleNotification
          );
        }
      },
      onStompError: () => {
        setIsConnected(false);
      },
      onWebSocketClose: () => {
        setIsConnected(false);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();
  }, [enabled, handleNotification, disconnect]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    isConnected,
    connect,
    disconnect,
  };
}

