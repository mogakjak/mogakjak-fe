"use client";

import { useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export type UserActiveStatusEvent = {
  userId: string;
  isActive: boolean;
};

type UseMateActiveStatusOptions = {
  enabled?: boolean;
  onStatusChange?: (event: UserActiveStatusEvent) => void;
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

export function useMateActiveStatus({
  enabled = true,
  onStatusChange,
}: UseMateActiveStatusOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const connect = async () => {
      const token = await getTokenFromServer();
      if (!token) {
        console.error("[useMateActiveStatus] 토큰을 가져올 수 없습니다.");
        return;
      }

      const connectHeaders: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      const client = new Client({
        webSocketFactory: () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return new SockJS(getWebSocketUrl()) as any;
        },
        connectHeaders,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
          console.log("[useMateActiveStatus] WebSocket 연결됨, frame:", frame);
          setIsConnected(true);

          // 메이트 isActive 상태 변경 구독
          console.log("[useMateActiveStatus] 구독 시작: /topic/mates/active-status");
          const subscription = client.subscribe(
            "/topic/mates/active-status",
            (message: IMessage) => {
              try {
                console.log("[useMateActiveStatus] ===== 메시지 수신 ===== ");
                console.log("[useMateActiveStatus] 원본 메시지 body:", message.body);
                console.log("[useMateActiveStatus] 메시지 헤더:", message.headers);
                const event: UserActiveStatusEvent = JSON.parse(message.body);
                console.log("[useMateActiveStatus] 파싱된 이벤트:", event);
                console.log("[useMateActiveStatus] onStatusChange 호출 전, callback 존재:", !!onStatusChangeRef.current);
                if (onStatusChangeRef.current) {
                  onStatusChangeRef.current(event);
                  console.log("[useMateActiveStatus] onStatusChange 호출 완료");
                } else {
                  console.warn("[useMateActiveStatus] onStatusChange callback이 없습니다!");
                }
              } catch (error) {
                console.error("[useMateActiveStatus] 메시지 파싱 실패:", error, "원본:", message.body);
              }
            }
          );

          if (!subscription) {
            console.error("[useMateActiveStatus] 구독 실패!");
          } else {
            console.log("[useMateActiveStatus] 구독 성공: /topic/mates/active-status, subscription:", subscription);
          }
        },
        onStompError: (frame) => {
          console.error("[useMateActiveStatus] STOMP 에러:", frame);
          console.error("[useMateActiveStatus] STOMP 에러 상세:", JSON.stringify(frame, null, 2));
          setIsConnected(false);
        },
        onWebSocketError: (event) => {
          console.error("[useMateActiveStatus] WebSocket 에러:", event);
        },
        onWebSocketClose: (event) => {
          console.log("[useMateActiveStatus] WebSocket 연결 종료:", event);
          setIsConnected(false);
        },
        onDisconnect: () => {
          console.log("[useMateActiveStatus] WebSocket 연결 해제");
          setIsConnected(false);
        },
        debug: (str) => {
          console.log("[useMateActiveStatus] STOMP 디버그:", str);
        },
      });

      // 연결 시작
      client.activate();
      clientRef.current = client;
    };

    connect();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [enabled]);

  return { isConnected };
}

