"use client";

import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useAuthState } from "../auth/useAuthState";

export interface ChatMessage {
  senderEmail: string;
  message: string;
  roomId?: string;
  timestamp?: string;
}

function getWebSocketUrl(): string {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  const base = apiBase.replace(/\/+$/, "");
  return `${base}/connect`;
}

export function useChatSocket(roomId?: string, shouldConnect: boolean = true) {
  const { token, isLoggedIn, ready } = useAuthState();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!roomId) {
      setError("채팅방 ID가 필요합니다");
      return;
    }

    if (!shouldConnect) {
      console.log("WebSocket 연결 대기 중 (채팅방 참여 완료 대기)...");
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (!ready) {
      console.log("Auth not ready yet, waiting...");
      return;
    }

    if (!isLoggedIn || !token) {
      console.warn("Not logged in or no token, attempting connection anyway...");
    }

    const wsUrl = getWebSocketUrl();
    console.log("Connecting to WebSocket:", wsUrl);
    console.log("Room ID:", roomId);

    setIsConnecting(true);
    setError(null);

    let client: Client | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let SockJS: any = null;

    const initWebSocket = async () => {
      try {
        SockJS = (await import("sockjs-client")).default;

        client = new Client({
          webSocketFactory: () => {
            const sock = new SockJS(wsUrl);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return sock as any;
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          debug: (str) => {
            if (process.env.NODE_ENV === "development") {
              console.log("STOMP:", str);
            }
          },
          connectHeaders: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
          onConnect: (frame) => {
            console.log("STOMP Connected!", frame);
            setIsConnecting(false);
            setIsConnected(true);
            setError(null);

            // 채팅방 Topic 구독
            const subscription = client!.subscribe(
              `/topic/${roomId}`,
              (message) => {
                try {
                  console.log("📨 [채팅] WebSocket 메시지 수신!");
                  console.log("📦 원본 메시지 body:", message.body);

                  const payload: ChatMessage = JSON.parse(message.body);
                  console.log("✅ [채팅] 파싱된 메시지:", payload);

                  setMessages((prev) => [...prev, payload]);
                  setError(null);
                } catch (err) {
                  console.error("❌ [채팅] 메시지 파싱 실패:", err);
                  console.error("❌ 원본 메시지:", message.body);
                  setError("Failed to parse chat message");
                }
              },
              {
                Authorization: token ? `Bearer ${token}` : undefined,
              }
            );

            console.log(`✅ /topic/${roomId} 구독 완료`);

            // 구독 정보 저장
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (client as any)._chatSubscription = subscription;
          },
          onStompError: (frame) => {
            console.error("STOMP Error:", frame);
            setIsConnecting(false);
            setIsConnected(false);
            const errorMsg =
              frame.headers?.["message"] || frame.body || "STOMP 연결 오류";
            setError(errorMsg);
          },
          onWebSocketClose: () => {
            console.log("WebSocket closed");
            setIsConnecting(false);
            setIsConnected(false);
          },
          onWebSocketError: (error) => {
            console.error("WebSocket error:", error);
            setIsConnecting(false);
            setIsConnected(false);
            setError(
              `WebSocket 연결 오류: ${error.message || "알 수 없는 오류"}`
            );
          },
        });

        client.activate();
        clientRef.current = client;
      } catch (err) {
        console.error("Failed to initialize WebSocket:", err);
        setError("WebSocket 초기화 실패");
        setIsConnecting(false);
      }
    };

    initWebSocket();

    return () => {
      console.log("Cleaning up WebSocket connection");
      if (clientRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((clientRef.current as any)._chatSubscription) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (clientRef.current as any)._chatSubscription.unsubscribe();
        }
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [ready, isLoggedIn, roomId, token, shouldConnect]);

  const sendMessage = (message: string, senderEmail: string) => {
    if (!clientRef.current || !isConnected) {
      console.error("❌ Not connected to WebSocket");
      setError("Not connected to WebSocket");
      return;
    }

    if (!roomId) {
      console.error("❌ Room ID is required");
      setError("Room ID is required");
      return;
    }

    try {
      const messageBody: ChatMessage = {
        senderEmail,
        message,
        roomId,
      };

      console.log("📤 [채팅] 메시지 전송:");
      console.log("   Destination: /publish/" + roomId);
      console.log("   Body:", JSON.stringify(messageBody));

      clientRef.current.publish({
        destination: `/publish/${roomId}`,
        body: JSON.stringify(messageBody),
      });
      console.log("✅ [채팅] 메시지 전송 완료");
    } catch (err) {
      console.error("❌ [채팅] 메시지 전송 실패:", err);
      setError("Failed to send message");
    }
  };

  return {
    isConnected,
    isConnecting,
    messages,
    error,
    sendMessage,
  };
}

