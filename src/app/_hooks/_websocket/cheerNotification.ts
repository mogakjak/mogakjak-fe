"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { getUserIdFromToken } from "@/app/_utils/jwt";
import type { CheerNotification } from "@/app/_types/groups";
import {
  createWebSocketClient,
  subscribeToTopic,
  getTokenFromServer,
  type WebSocketClientConfig,
} from "@/app/api/websocket/api";

type UseCheerNotificationOptions = {
  enabled?: boolean;
  onNotification?: (notification: CheerNotification) => void;
};

export function useCheerNotification({
  enabled = true,
  onNotification,
}: UseCheerNotificationOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const onNotificationRef = useRef(onNotification);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  const handleNotification = useCallback((message: IMessage) => {
    try {
      const notification: CheerNotification = JSON.parse(message.body);
      onNotificationRef.current?.(notification);
    } catch (error) {
      console.error("[WebSocket] 메시지 파싱 실패:", error);
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
      console.error("[WebSocket] 토큰을 찾을 수 없습니다.");
      return;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      console.error("[WebSocket] 토큰에서 사용자 ID를 추출할 수 없습니다.");
      return;
    }
    userIdRef.current = userId;

    try {
      const config: WebSocketClientConfig = {
        onConnect: () => {
          setIsConnected(true);

          if (!userIdRef.current) {
            console.error("[WebSocket] userIdRef.current가 null입니다!");
            return;
          }

          if (clientRef.current) {
            const subscription = subscribeToTopic(
              clientRef.current,
              `/topic/user/${userIdRef.current}/cheer`,
              handleNotification
            );

            if (!subscription) {
              console.error("[WebSocket] 응원 알림 구독 실패!");
            }
          }
        },
        onStompError: (frame) => {
          console.error("[WebSocket] STOMP 에러:", frame);
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
      console.error("[WebSocket] 연결 실패:", error);
      setIsConnected(false);
    }
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

