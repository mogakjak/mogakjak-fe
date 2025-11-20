"use client";

import { useEffect, useRef, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useMyGroups } from "./groups";
import type { FocusNotificationMessage } from "./useFocusNotification";

function getWebSocketUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_PROXY;
  
  // 개발 환경에서 기본값 설정
  if (!apiBase) {
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:8080/connect";
    }
    throw new Error("NEXT_PUBLIC_API_PROXY is not defined");
  }

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

/**
 * 사용자가 속한 모든 그룹의 집중 체크 알림을 전역적으로 구독하는 훅
 */
export function useGlobalFocusNotifications(
  onNotification?: (message: FocusNotificationMessage) => void
) {
  const { data: groups = [] } = useMyGroups();
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, any>>(new Map());

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

  const connect = useCallback(() => {
    // 그룹이 없으면 연결하지 않음 (토큰은 쿠키에서 자동으로 전달됨)
    console.log("[WebSocket Debug] Groups:", groups.length);
    if (groups.length === 0) {
      console.warn("[WebSocket] 연결하지 않음 - 그룹이 없습니다:", groups.length);
      return;
    }

    // 기존 연결이 있으면 정리
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      subscriptionsRef.current.clear();
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
        console.log("[WebSocket] Connected globally");

        // 모든 그룹에 대해 알림 구독
        groups.forEach((group) => {
          const destination = `/topic/group/${group.groupId}/notification`;
          const subscription = client.subscribe(
            destination,
            (message) => handleNotification(message, group.groupId)
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
        const subscription = client.subscribe(
          destination,
          (message) => handleNotification(message, group.groupId)
        );
        subscriptionsRef.current.set(group.groupId, subscription);
        console.log(`[WebSocket] Subscribed to ${destination}`);
      }
    });

    // 제거된 그룹 구독 해제
    subscribedGroupIds.forEach((groupId) => {
      if (!currentGroupIds.has(groupId)) {
        const subscription = subscriptionsRef.current.get(groupId);
        if (subscription) {
          subscription.unsubscribe();
          subscriptionsRef.current.delete(groupId);
          console.log(`[WebSocket] Unsubscribed from /topic/group/${groupId}/notification`);
        }
      }
    });
  }, [groups, handleNotification]);
}

