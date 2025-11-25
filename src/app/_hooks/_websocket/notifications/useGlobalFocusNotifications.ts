"use client";

import { useEffect, useRef, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useMyGroups } from "@/app/_hooks/groups/useMyGroups";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
import type { FocusNotificationMessage } from "./useFocusNotification";
import { getWebSocketUrl } from "@/app/api/websocket/api";
export function useGlobalFocusNotifications(
  onNotification?: (message: FocusNotificationMessage) => void
) {
  const { data: groups = [] } = useMyGroups();
  const { token } = useAuthState();
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, unknown>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (groups.length === 0 || !token) {
      return;
    }

    if (clientRef.current) {
      clientRef.current.deactivate();
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
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
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
        subscriptionsRef.current.clear();
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (groups.length > 0) {
            if (clientRef.current) {
              try {
                clientRef.current.deactivate();
              } catch {}
              clientRef.current = null;
            }
            connect();
          }
        }, 10000);
      },
      onWebSocketClose: () => {
        subscriptionsRef.current.clear();
      },
      onDisconnect: () => {
        subscriptionsRef.current.clear();
      },
    });

    clientRef.current = client;
    client.activate();
  }, [groups, handleNotification, token]);

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

  useEffect(() => {
    if (groups.length > 0) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [groups.length, connect, disconnect]);

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
