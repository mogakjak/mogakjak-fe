"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getUserIdFromToken } from "@/app/_utils/jwt";
import type { CheerNotification } from "@/app/_types/groups";

type UseCheerNotificationOptions = {
  enabled?: boolean;
  onNotification?: (notification: CheerNotification) => void;
};

function getWebSocketUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_PROXY || "https://mogakjak.site";
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  
  if (apiBase.startsWith("//")) {
    return isHttps ? `https:${apiBase}/connect` : `http:${apiBase}/connect`;
  }
  if (apiBase.startsWith("http://")) {
    if (isHttps) {
      return apiBase.replace("http://", "https://") + "/connect";
    }
    return `${apiBase}/connect`;
  }
  if (apiBase.startsWith("https://")) {
    return `${apiBase}/connect`;
  }
  const protocol = isHttps ? "https://" : "http://";
  return `${protocol}${apiBase}/connect`;
}

async function getTokenFromServer(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/token", {
      method: "GET",
      credentials: "include",
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

        if (!userIdRef.current) {
          console.error("[WebSocket] userIdRef.current가 null입니다!");
          return;
        }

        const subscription = clientRef.current?.subscribe(
          `/topic/user/${userIdRef.current}/cheer`,
          handleNotification
        );

        if (!subscription) {
          console.error("[WebSocket] 응원 알림 구독 실패!");
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
