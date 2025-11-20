"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

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

function getWebSocketUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_PROXY;
  
  // 개발 환경에서 기본값 설정
  if (!apiBase) {
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:8080/connect";
    }
    throw new Error("NEXT_PUBLIC_API_PROXY is not defined");
  }

  // API_BASE에서 http:// 또는 https://를 ws:// 또는 wss://로 변환
  // SockJS는 http/https를 사용하므로 변환하지 않음
  return `${apiBase}/connect`;
}

function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  
  // 쿠키에서 토큰 가져오기
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "mg_access_token") {
      return decodeURIComponent(value);
    }
  }
  return null;
}

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
        console.error("Failed to parse notification message:", error);
      }
    },
    [onNotification]
  );

  const connect = useCallback(() => {
    if (!enabled || !groupId) return;

    // 기존 연결이 있으면 정리
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    const wsUrl = getWebSocketUrl();

    const client = new Client({
      webSocketFactory: () => {
        return new SockJS(wsUrl) as any;
      },
      // 쿠키가 자동으로 전달되므로 헤더에 토큰을 포함시킬 필요 없음
      connectHeaders: {},
      debug: (str) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[STOMP]", str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        console.log("[WebSocket] Connected");

        // 그룹 알림 구독
        const destination = `/topic/group/${groupId}/notification`;
        client.subscribe(destination, handleNotification);
        console.log(`[WebSocket] Subscribed to ${destination}`);
      },
      onStompError: (frame) => {
        console.error("[WebSocket] STOMP error:", frame);
        setIsConnected(false);
      },
      onWebSocketClose: () => {
        console.log("[WebSocket] Connection closed");
        setIsConnected(false);
      },
      onDisconnect: () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();
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

