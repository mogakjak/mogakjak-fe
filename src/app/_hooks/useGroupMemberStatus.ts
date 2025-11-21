"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export type GroupMemberStatus = {
  groupId: string;
  userId: string;
  nickname: string;
  profileUrl?: string;
  level: number;
  participationStatus: "NOT_PARTICIPATING" | "RESTING" | "PARTICIPATING";
  enteredAt?: string;
  daysSinceLastParticipation?: number;
  personalTimerSeconds?: number;
  todoTitle?: string;
};

export type GroupMemberStatusUpdate = {
  groupId: string;
  members?: GroupMemberStatus[];
  updatedMember?: GroupMemberStatus;
};

type UseGroupMemberStatusOptions = {
  groupId: string;
  enabled?: boolean;
  onUpdate?: (update: GroupMemberStatusUpdate) => void;
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

export function useGroupMemberStatus({
  groupId,
  enabled = true,
  onUpdate,
}: UseGroupMemberStatusOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const onUpdateRef = useRef(onUpdate);

  // onUpdate를 ref로 관리하여 변경되어도 재연결하지 않도록 함
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const handleUpdate = useCallback((message: IMessage) => {
    try {
      const update: GroupMemberStatusUpdate = JSON.parse(message.body);
      console.log("[WebSocket] 그룹 멤버 상태 업데이트:", update);
      onUpdateRef.current?.(update);
    } catch (error) {
      console.error("[WebSocket] 메시지 파싱 실패:", error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      console.log("[WebSocket] 연결 해제 시작");
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!enabled || !groupId) return;

    // 기존 연결이 있으면 먼저 정리
    if (clientRef.current) {
      console.log("[WebSocket] 기존 연결 정리 중...");
      disconnect();
      // 연결 정리 후 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 서버에서 토큰 가져오기
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
      connectHeaders,
      debug: (str) => {
        // 디버그 로그는 필요시에만 활성화
        // console.log("[WebSocket Debug]", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("[WebSocket] 연결 성공");
        setIsConnected(true);

        // 그룹 멤버 상태 구독
        const subscription = clientRef.current?.subscribe(
          `/topic/group/${groupId}/member-status`,
          handleUpdate
        );

        if (subscription) {
          console.log(
            "[WebSocket] 그룹 멤버 상태 구독 완료:",
            `/topic/group/${groupId}/member-status`
          );
        }
      },
      onStompError: (frame) => {
        console.error("[WebSocket] STOMP 에러:", frame);
        setIsConnected(false);
      },
      onWebSocketClose: (event) => {
        console.log("[WebSocket] 연결 종료", event.code, event.reason);
        setIsConnected(false);
      },
      onDisconnect: () => {
        console.log("[WebSocket] 연결 해제");
        setIsConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();
  }, [enabled, groupId, handleUpdate, disconnect]);

  useEffect(() => {
    if (enabled && groupId) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, groupId]); // connect와 disconnect를 의존성에서 제거

  return {
    isConnected,
    connect,
    disconnect,
  };
}

