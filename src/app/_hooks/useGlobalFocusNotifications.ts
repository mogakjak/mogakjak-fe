"use client";

import { useEffect, useRef, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useMyGroups } from "./groups";
import type { FocusNotificationMessage } from "./useFocusNotification";

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

/**
 * 사용자가 속한 모든 그룹의 집중 체크 알림을 전역적으로 구독하는 훅
 */
export function useGlobalFocusNotifications(
  onNotification?: (message: FocusNotificationMessage) => void
) {
  const { data: groups = [] } = useMyGroups();
  const clientRef = useRef<Client | null>(null);
  // STOMP subscription 타입은 라이브러리에서 제공하지 않으므로 unknown 사용
  const subscriptionsRef = useRef<Map<string, unknown>>(new Map());

  const handleNotification = useCallback(
    (message: IMessage, groupId: string) => {
      try {
        const notification: FocusNotificationMessage = JSON.parse(message.body);
        // groupId가 일치하는지 확인
        if (notification.groupId === groupId) {
          onNotification?.(notification);
        }
      } catch (error) {
        console.error("Failed to parse notification message:", error);
      }
    },
    [onNotification]
  );

  const connect = useCallback(async () => {
    // 그룹이 없으면 연결하지 않음
    console.log("[WebSocket Debug] Groups:", groups.length);
    if (groups.length === 0) {
      console.warn(
        "[WebSocket] 연결하지 않음 - 그룹이 없습니다:",
        groups.length
      );
      return;
    }

    // 기존 연결이 있으면 정리
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      subscriptionsRef.current.clear();
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
        console.log("[WebSocket] Connected globally");

        // 모든 그룹에 대해 알림 구독
        groups.forEach((group) => {
          const destination = `/topic/group/${group.groupId}/notification`;
          const subscription = client.subscribe(destination, (message) =>
            handleNotification(message, group.groupId)
          );
          subscriptionsRef.current.set(group.groupId, subscription);
          console.log(`[WebSocket] Subscribed to ${destination}`);
        });
      },
      onStompError: (frame) => {
        console.error("[WebSocket] STOMP error:", frame);
      },
      onWebSocketClose: () => {
        console.log("[WebSocket] Connection closed");
        subscriptionsRef.current.clear();
      },
      onDisconnect: () => {
        console.log("[WebSocket] Disconnected");
        subscriptionsRef.current.clear();
      },
    });

    clientRef.current = client;
    client.activate();
  }, [groups, handleNotification]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    subscriptionsRef.current.clear();
  }, []);

  useEffect(() => {
    // 그룹 목록이 변경되면 재연결
    if (groups.length > 0) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [groups.length, connect, disconnect]);

  // 그룹이 추가/제거될 때마다 구독 업데이트
  useEffect(() => {
    const client = clientRef.current;
    if (!client) {
      return;
    }

    // STOMP 클라이언트의 연결 상태 확인
    const isConnected = client.connected || false;
    if (!isConnected) {
      return;
    }

    const currentGroupIds = new Set(groups.map((g) => g.groupId));
    const subscribedGroupIds = new Set(subscriptionsRef.current.keys());

    // 새로 추가된 그룹 구독
    groups.forEach((group) => {
      if (!subscribedGroupIds.has(group.groupId)) {
        const destination = `/topic/group/${group.groupId}/notification`;
        const subscription = client.subscribe(destination, (message) =>
          handleNotification(message, group.groupId)
        );
        subscriptionsRef.current.set(group.groupId, subscription);
        console.log(`[WebSocket] Subscribed to ${destination}`);
      }
    });

    // 제거된 그룹 구독 해제
    subscribedGroupIds.forEach((groupId) => {
      if (!currentGroupIds.has(groupId)) {
        const subscription = subscriptionsRef.current.get(groupId);
        if (
          subscription &&
          typeof subscription === "object" &&
          "unsubscribe" in subscription
        ) {
          (subscription as { unsubscribe: () => void }).unsubscribe();
          subscriptionsRef.current.delete(groupId);
          console.log(
            `[WebSocket] Unsubscribed from /topic/group/${groupId}/notification`
          );
        }
      }
    });
  }, [groups, handleNotification]);
}
