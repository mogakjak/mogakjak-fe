"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useMyGroups } from "@/app/_hooks/groups/useMyGroups";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
import type { FocusNotificationMessage } from "./useFocusNotification";
import { getWebSocketUrl } from "@/app/api/websocket/api";
import { afterLCP } from "@/app/_utils/performance";

export function useGlobalFocusNotifications(
  onNotification?: (message: FocusNotificationMessage) => void,
  options?: {
    enabled?: boolean;
  }
) {
  const { data: groups = [] } = useMyGroups();
  const { token } = useAuthState();
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, unknown>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);
  const isConnectingRef = useRef(false);

  const handleNotification = useCallback(
    (message: IMessage, groupId: string) => {
      try {
        const notification: FocusNotificationMessage = JSON.parse(message.body);
        if (notification.groupId === groupId) {
          onNotification?.(notification);
        }
      } catch {
        // 메시지 파싱 실패
      }
    },
    [onNotification]
  );

  const connect = useCallback(() => {
    if (groups.length === 0 || !token || !shouldConnect) {
      return;
    }

    if (isConnectingRef.current || clientRef.current?.connected) {
      return;
    }

    isConnectingRef.current = true;

    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch {}
      clientRef.current = null;
      subscriptionsRef.current.clear();
    }

    const wsUrl = getWebSocketUrl();

    const client = new Client({
      webSocketFactory: () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sock = new SockJS(wsUrl) as any;
        return sock;
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: () => {
        // 디버그 로그는 필요시에만 활성화
      },
      reconnectDelay: 0, // 자동 재연결 비활성화
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        isConnectingRef.current = false; // 연결 성공 시 플래그 리셋
        setTimeout(() => {
          if (!clientRef.current || !clientRef.current.connected) {
            return;
          }
          groups.forEach((group) => {
            try {
              if (
                !group.groupId ||
                group.groupId === "undefined" ||
                group.groupId === ""
              ) {
                return;
              }

              const destination = `/topic/group/${group.groupId}/notification`;

              const subscription = client.subscribe(
                destination,
                (message) => {
                  handleNotification(message, group.groupId);
                },
                {
                  id: `sub-${group.groupId}-${Date.now()}`,
                }
              );

              subscriptionsRef.current.set(group.groupId, subscription);
            } catch {
              // 구독 실패
            }
          });
        }, 100);
      },
      onStompError: () => {
        isConnectingRef.current = false;
        subscriptionsRef.current.clear();
        // 재연결은 자동으로 STOMP 클라이언트가 처리하므로 수동 재연결 제거
      },
      onWebSocketClose: () => {
        isConnectingRef.current = false;
        subscriptionsRef.current.clear();
      },
      onDisconnect: () => {
        isConnectingRef.current = false;
        subscriptionsRef.current.clear();
      },
    });

    clientRef.current = client;
    client.activate();
  }, [groups, handleNotification, token, shouldConnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch {}
      clientRef.current = null;
    }
    subscriptionsRef.current.clear();
  }, []);

  // LCP 이후에 연결 허용
  useEffect(() => {
    if (options?.enabled === false) {
      setShouldConnect(false);
      return;
    }

    const cleanup = afterLCP(() => {
      setShouldConnect(true);
    });

    return cleanup;
  }, [options?.enabled]);

  // 연결 실행
  useEffect(() => {
    if (options?.enabled === false) {
      disconnect();
      return;
    }

    if (groups.length > 0 && shouldConnect) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [groups.length, shouldConnect, connect, disconnect, options?.enabled]);

  useEffect(() => {
    const client = clientRef.current;
    if (!client) {
      return;
    }

    const isConnected = client.connected || false;
    if (!isConnected) {
      return;
    }

    const currentGroupIds = new Set(groups.map((g) => g.groupId));
    const subscribedGroupIds = new Set(subscriptionsRef.current.keys());

    groups.forEach((group) => {
      if (!subscribedGroupIds.has(group.groupId)) {
        const destination = `/topic/group/${group.groupId}/notification`;
        const subscription = client.subscribe(destination, (message) =>
          handleNotification(message, group.groupId)
        );
        subscriptionsRef.current.set(group.groupId, subscription);
      }
    });

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
        }
      }
    });
  }, [groups, handleNotification]);
}
