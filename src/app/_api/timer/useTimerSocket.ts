"use client";

import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useAuthState } from "../auth/useAuthState";

type TimerMode = "TIMER" | "POMODORO";
type TimerStatus = "IDLE" | "RUNNING" | "PAUSED" | "FINISHED";

export interface TimerUpdatePayload {
  sessionId: string;
  mode: TimerMode;
  status: TimerStatus;
  startedAt?: string;
  endedAt?: string;
  remainingSeconds?: number;
  totalDuration?: number;
}

interface TimerStartRequest {
  timerMode: TimerMode;
  targetSeconds: number;
}

function getWebSocketUrl(): string {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  // URL에서 trailing slash 제거
  const base = apiBase.replace(/\/+$/, "");
  // 백엔드에서 /connect를 사용하므로 /ws가 아닌 /connect 사용
  return `${base}/connect`;
}

export function useTimerSocket(userId?: string | number) {
  const { token, isLoggedIn, ready } = useAuthState();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [timerData, setTimerData] = useState<TimerUpdatePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    // userId가 없으면 연결 시도 안 함
    if (!userId) {
      setError("사용자 ID가 필요합니다");
      return;
    }

    // 브라우저에서만 실행
    if (typeof window === "undefined") {
      return;
    }

    // 인증 상태가 준비되지 않았으면 대기
    if (!ready) {
      console.log("Auth not ready yet, waiting...");
      return;
    }

    // 로그인하지 않았거나 토큰이 없어도 테스트할 수 있도록 경고만 표시
    if (!isLoggedIn || !token) {
      console.warn(
        "Not logged in or no token, attempting connection anyway..."
      );
    }

    const wsUrl = getWebSocketUrl();
    console.log("Connecting to WebSocket:", wsUrl);
    console.log("User ID:", userId);
    console.log("Has token:", !!token);
    console.log("Is logged in:", isLoggedIn);

    setIsConnecting(true);
    setError(null);

    // SockJS를 동적으로 import (useEffect 내부에서만)
    let client: Client | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let SockJS: any = null;

    const initWebSocket = async () => {
      try {
        // 동적 import로 SockJS 로드
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

            // 개인 타이머 구독
            // ⚠️ 주의: 백엔드에 `/topic/timer/{userId}` 엔드포인트가 구현되면 주석 해제
            // 현재는 백엔드에 타이머 WebSocket이 구현되지 않아서 구독하지 않음
            console.log(`⚠️ [개인 타이머] 구독 시도: /topic/timer/${userId}`);
            console.log(`⚠️ 백엔드에 타이머 WebSocket이 구현되지 않아 구독을 건너뜁니다.`);
            console.log(`⚠️ 백엔드에 TimerSocketController를 추가하고 /topic/timer/{userId}를 구현해야 합니다.`);
            
            // TODO: 백엔드에 타이머 WebSocket이 구현되면 아래 주석 해제
            /*
            const personalSubscription = client!.subscribe(
              `/topic/timer/${userId}`,
              (message) => {
                try {
                  console.log("📨 [개인 타이머] WebSocket 메시지 수신!");
                  console.log("📦 원본 메시지 body:", message.body);
                  console.log("📦 메시지 헤더:", message.headers);

                  const payload: TimerUpdatePayload = JSON.parse(message.body);
                  console.log("✅ [개인 타이머] 파싱된 업데이트:", payload);
                  console.log(
                    "⏱️ [개인 타이머] remainingSeconds:",
                    payload.remainingSeconds
                  );

                  setTimerData(payload);
                  setError(null);
                } catch (err) {
                  console.error("❌ [개인 타이머] 메시지 파싱 실패:", err);
                  console.error("❌ 원본 메시지:", message.body);
                  setError("Failed to parse timer update");
                }
              }
            );

            console.log(`✅ /topic/timer/${userId} 구독 완료`);
            console.log(`🔍 구독한 경로: /topic/timer/${userId}`);

            // 구독 정보 저장
            (client as any)._personalSubscription = personalSubscription;
            */
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
        // TODO: 백엔드에 타이머 WebSocket이 구현되면 주석 해제
        // if ((clientRef.current as any)._personalSubscription) {
        //   (clientRef.current as any)._personalSubscription.unsubscribe();
        // }
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [ready, isLoggedIn, userId, token]);

  const startTimer = (request: TimerStartRequest) => {
    if (!clientRef.current || !isConnected) {
      console.error("❌ Not connected to WebSocket");
      setError("Not connected to WebSocket");
      return;
    }

    try {
      const messageBody = JSON.stringify(request);
      console.log("📤 [타이머 시작] 요청 전송:");
      console.log("   Destination: /app/timer/start");
      console.log("   Body:", messageBody);
      console.log("   User ID:", userId);

      clientRef.current.publish({
        destination: `/publish/timer/start`,
        body: messageBody,
      });
      console.log("✅ [타이머 시작] 요청 전송 완료 - 서버 응답 대기 중...");
    } catch (err) {
      console.error("❌ [타이머 시작] 요청 전송 실패:", err);
      setError("Failed to send start request");
    }
  };

  const stopTimer = () => {
    if (!clientRef.current || !isConnected) {
      console.error("Not connected to WebSocket");
      setError("Not connected to WebSocket");
      return;
    }

    try {
      clientRef.current.publish({
        destination: `/publish/timer/stop`,
        body: JSON.stringify({}),
      });
      console.log("Timer stop request sent");
    } catch (err) {
      console.error("Failed to send stop request:", err);
      setError("Failed to send stop request");
    }
  };

  return {
    isConnected,
    isConnecting,
    timerData,
    error,
    startTimer,
    stopTimer,
  };
}
