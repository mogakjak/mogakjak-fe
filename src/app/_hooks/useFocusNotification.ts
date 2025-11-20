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

  // 환경 변수가 없으면 프로덕션 URL 사용
  if (!apiBase) {
    return "https://mogakjak.site/connect";
  }

  // SockJS는 http/https를 사용하므로 변환하지 않음
  return `${apiBase}/connect`;
}

// 서버에서 토큰 가져오기 (httpOnly 쿠키는 JavaScript로 읽을 수 없음)
async function getTokenFromServer(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/token", {
      method: "GET",
      credentials: "include", // 쿠키 포함
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.token || null;
  } catch (error) {
    console.error("[WebSocket] 토큰 가져오기 실패:", error);
    return null;
  }
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

  const connect = useCallback(async () => {
    if (!enabled || !groupId) return;

    // 기존 연결이 있으면 정리
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    // 서버에서 토큰 가져오기 (httpOnly 쿠키는 JavaScript로 읽을 수 없음)
    const token = await getTokenFromServer();

    if (!token) {
      console.error("[WebSocket] 토큰을 찾을 수 없습니다.");
      console.error("[WebSocket] 웹소켓 연결을 중단합니다.");
      return;
    }

    console.log("[WebSocket] 토큰 발견, 길이:", token.length);

    // STOMP CONNECT 헤더에 토큰 포함
    const connectHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    console.log("[WebSocket] CONNECT 헤더 설정:", {
      Authorization: `Bearer ${token.substring(0, 20)}...`,
    });

    const wsUrl = getWebSocketUrl();

    const client = new Client({
      webSocketFactory: () => {
        // SockJS는 WebSocket-like 인터페이스를 제공하므로 타입 단언 필요
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sock = new SockJS(wsUrl) as any;
        console.log("[WebSocket] SockJS 생성 완료, URL:", wsUrl);
        return sock;
      },
      // STOMP CONNECT 프레임에 Authorization 헤더 포함
      // @stomp/stompjs는 connectHeaders를 STOMP CONNECT 프레임의 헤더로 변환
      connectHeaders,
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
