"use client";

import { useEffect, useRef, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useMyGroups } from "./groups";
import { useAuthState } from "@/app/api/auth/useAuthState";
import type { FocusNotificationMessage } from "./useFocusNotification";

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
        console.log("[WebSocket] handleNotification called:", { body: message.body, groupId });
        const notification: FocusNotificationMessage = JSON.parse(message.body);
        console.log("[WebSocket] Parsed notification:", notification);
        if (notification.groupId === groupId) {
          console.log("[WebSocket] Calling onNotification callback:", notification);
          onNotification?.(notification);
        } else {
          console.warn("[WebSocket] GroupId mismatch:", { 
            notificationGroupId: notification.groupId, 
            expectedGroupId: groupId 
          });
        }
      } catch (error) {
        console.error("Failed to parse notification message:", error);
      }
    },
    [onNotification]
  );

  const connect = useCallback(() => {
    console.log("[WebSocket Debug] Groups:", groups.length);
    console.log("[WebSocket Debug] Group IDs:", groups.map(g => g.groupId));
    console.log("[WebSocket Debug] Token:", token ? "Present" : "Missing");

    if (groups.length === 0) {
      console.warn(
        "[WebSocket] 연결하지 않음 - 그룹이 없습니다:",
        groups.length
      );
      return;
    }

    if (!token) {
      console.warn("[WebSocket] 연결하지 않음 - 토큰이 없습니다");
      return;
    }

    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      subscriptionsRef.current.clear();
    }

    const wsUrl = getWebSocketUrl();
    console.log("[WebSocket] WebSocket URL:", wsUrl);
    console.log("[WebSocket] Current page protocol:", typeof window !== "undefined" ? window.location.protocol : "unknown");

    const client = new Client({
      webSocketFactory: () => { 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sock = new SockJS(wsUrl) as any;
        console.log("[WebSocket] SockJS 생성 완료, URL:", wsUrl);
        return sock;
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
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
        console.log("[WebSocket] Groups to subscribe:", groups.map(g => ({ groupId: g.groupId, groupName: g.groupName })));
        setTimeout(() => {
          if (!clientRef.current || !clientRef.current.connected) {
            console.warn("[WebSocket] Client disconnected before subscription");
            return;
          }
          groups.forEach((group, index) => {
            try {
              if (!group.groupId || group.groupId === "undefined" || group.groupId === "") {
                console.error(`[WebSocket] Invalid group ID at index ${index}:`, group);
                return;
              }
              
              const destination = `/topic/group/${group.groupId}/notification`;
              console.log(`[WebSocket] [${index + 1}/${groups.length}] Subscribing to: ${destination}`, {
                groupId: group.groupId,
                groupName: group.groupName,
              });
              
              const subscription = client.subscribe(
                destination,
                (message) => {
                  console.log(`[WebSocket] Received message for group ${group.groupId}:`, message.body);
                  console.log(`[WebSocket] Calling handleNotification for group ${group.groupId}`);
                  handleNotification(message, group.groupId);
                },
                {
                  id: `sub-${group.groupId}-${Date.now()}`,
                }
              );
              
              subscriptionsRef.current.set(group.groupId, subscription);
              console.log(`[WebSocket] ✓ Successfully subscribed to ${destination}`);
            } catch (error) {
              console.error(`[WebSocket] ✗ Failed to subscribe to group ${group.groupId}:`, error, {
                group: group,
              });
            }
          });
        }, 100); 
      },
      onStompError: (frame) => {
        console.error("[WebSocket] STOMP error:", frame);
        subscriptionsRef.current.clear();
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (groups.length > 0) {
            console.log("[WebSocket] Attempting to reconnect after STOMP error...");
            if (clientRef.current) {
              try {
                clientRef.current.deactivate();
              } catch {
              }
              clientRef.current = null;
            }
            connect();
          }
        }, 10000); 
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
  }, [groups, handleNotification, token]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch {
      }
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
        console.log(`[WebSocket] Subscribed to ${destination}`);
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
          console.log(
            `[WebSocket] Unsubscribed from /topic/group/${groupId}/notification`
          );
        }
      }
    });
  }, [groups, handleNotification]);
}
