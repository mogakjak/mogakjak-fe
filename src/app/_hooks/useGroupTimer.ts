"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export type GroupTimerEvent = {
  groupId: string;
  sessionId: string;
  eventType: "START" | "PAUSE" | "RESUME" | "FINISH" | "SYNC";
  mode: "TIMER" | "STOPWATCH" | "POMODORO";
  status: "RUNNING" | "PAUSED" | "FINISHED";
  startedAt: string;
  pausedAt?: string;
  endedAt?: string;
  targetDuration?: number;
  totalDuration?: number; // 현재 세션의 총 시간
  accumulatedDuration?: number; // 그룹 누적 시간 (여러 세션을 거쳐 쌓인 시간)
  progressRate?: number;
  serverTime: string; // 서버 시간 (동기화용)
};

type UseGroupTimerOptions = {
  groupId: string;
  enabled?: boolean;
  onEvent?: (event: GroupTimerEvent) => void;
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

export function useGroupTimer({
  groupId,
  enabled = true,
  onEvent,
}: UseGroupTimerOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const handleEvent = useCallback((message: IMessage) => {
    try {
      const event: GroupTimerEvent = JSON.parse(message.body);
      onEventRef.current?.(event);
    } catch (error) {
      console.error("[WebSocket] 그룹 타이머 이벤트 파싱 실패:", error);
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
    if (!enabled || !groupId) return;

    if (clientRef.current) {
      disconnect();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const token = await getTokenFromServer();

    if (!token) {
      console.error("[WebSocket] 토큰을 찾을 수 없습니다.");
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

        // 그룹 타이머 이벤트 구독 (클로저로 client 직접 사용)
        const subscription = client.subscribe(
          `/topic/group/${groupId}/timer`,
          handleEvent
        );

        if (subscription) {
          console.log("[WebSocket] 그룹 타이머 구독 완료:", `/topic/group/${groupId}/timer`);
        } else {
          console.error("[WebSocket] 그룹 타이머 구독 실패!");
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
  }, [enabled, groupId, handleEvent, disconnect]);

  useEffect(() => {
    if (enabled && groupId) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, groupId]);

  return {
    isConnected,
    connect,
    disconnect,
  };
}

