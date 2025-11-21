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
  console.log("[CheerNotification] useCheerNotification 훅 초기화, enabled:", enabled, "onNotification:", !!onNotification);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const onNotificationRef = useRef(onNotification);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    console.log("[CheerNotification] onNotificationRef 업데이트");
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  const handleNotification = useCallback((message: IMessage) => {
    console.log("[CheerNotification] 메시지 수신됨:", {
      body: message.body,
      headers: message.headers,
      command: message.command,
    });
    try {
      const notification: CheerNotification = JSON.parse(message.body);
      console.log("[CheerNotification] 응원 알림 파싱 성공:", notification);
      console.log("[CheerNotification] onNotificationRef.current 호출 시도");
      onNotificationRef.current?.(notification);
      console.log("[CheerNotification] onNotificationRef.current 호출 완료");
    } catch (error) {
      console.error("[CheerNotification] 메시지 파싱 실패:", error, "body:", message.body);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      console.log("[WebSocket] 응원 알림 연결 해제 시작");
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const connect = useCallback(async () => {
    console.log("[CheerNotification] 연결 시도 시작, enabled:", enabled);
    if (!enabled) {
      console.log("[CheerNotification] enabled가 false이므로 연결하지 않음");
      return;
    }

    if (clientRef.current) {
      console.log("[CheerNotification] 기존 연결 정리 중...");
      disconnect();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("[CheerNotification] 토큰 가져오기 시도...");
    const token = await getTokenFromServer();

    if (!token) {
      console.error("[CheerNotification] 토큰을 찾을 수 없습니다.");
      return;
    }
    console.log("[CheerNotification] 토큰 가져오기 성공, 길이:", token.length);

    const userId = getUserIdFromToken(token);
    if (!userId) {
      console.error("[CheerNotification] 토큰에서 사용자 ID를 추출할 수 없습니다.");
      return;
    }
    console.log("[CheerNotification] 사용자 ID 추출 성공:", userId);
    userIdRef.current = userId;

    const connectHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    const wsUrl = getWebSocketUrl();
    console.log("[CheerNotification] WebSocket URL:", wsUrl);
    console.log("[CheerNotification] 구독할 토픽:", `/topic/user/${userId}/cheer`);

    const client = new Client({
      webSocketFactory: () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sock = new SockJS(wsUrl) as any;
        return sock;
      },
      connectHeaders,
      debug: (str) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[CheerNotification STOMP]", str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("[CheerNotification] WebSocket 연결 성공");
        setIsConnected(true);

        const topic = `/topic/user/${userIdRef.current}/cheer`;
        console.log("[CheerNotification] 구독 시도, 토픽:", topic);
        console.log("[CheerNotification] clientRef.current:", clientRef.current);
        console.log("[CheerNotification] userIdRef.current:", userIdRef.current);

        const subscription = clientRef.current?.subscribe(
          topic,
          handleNotification
        );

        if (subscription) {
          console.log("[CheerNotification] 응원 알림 구독 완료:", topic);
        } else {
          console.error("[CheerNotification] 구독 실패 - subscription이 null");
        }
      },
      onStompError: (frame) => {
        console.error("[CheerNotification] STOMP 에러:", frame);
        setIsConnected(false);
      },
      onWebSocketClose: (event) => {
        console.log("[CheerNotification] WebSocket 연결 종료", event.code, event.reason);
        setIsConnected(false);
      },
      onDisconnect: () => {
        console.log("[CheerNotification] WebSocket 연결 해제");
        setIsConnected(false);
      },
    });

    clientRef.current = client;
    console.log("[CheerNotification] Client 생성 완료, activate 호출");
    client.activate();
  }, [enabled, handleNotification, disconnect]);

  useEffect(() => {
    console.log("[CheerNotification] useEffect 실행, enabled:", enabled);
    if (enabled) {
      console.log("[CheerNotification] connect() 호출");
      connect();
    } else {
      console.log("[CheerNotification] enabled가 false이므로 연결하지 않음");
    }

    return () => {
      console.log("[CheerNotification] cleanup - disconnect 호출");
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

