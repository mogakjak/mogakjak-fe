"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
import type { FocusNotificationMessage } from "./useFocusNotification";
import { getWebSocketUrl } from "@/app/api/websocket/api";
import { afterLCP } from "@/app/_utils/performance";
import { getUserIdFromToken } from "@/app/_utils/jwt";

/**
 * 집중 체크 알림: 백엔드가 참여 중인 방에만 유저별 토픽으로 전송하므로
 * /topic/user/{userId}/focus-notification 한 개만 구독
 */
export function useGlobalFocusNotifications(
  onNotification?: (message: FocusNotificationMessage) => void,
  options?: {
    enabled?: boolean;
  }
) {
  const { token } = useAuthState();
  const userId = useMemo(
    () => (token ? getUserIdFromToken(token) : null),
    [token]
  );
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<ReturnType<Client["subscribe"]> | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);
  const isConnectingRef = useRef(false);
  const onNotificationRef = useRef(onNotification);
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  const connect = useCallback(() => {
    if (!userId || !token || !shouldConnect) {
      return;
    }

    if (isConnectingRef.current || clientRef.current?.connected) {
      return;
    }

    isConnectingRef.current = true;

    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch { }
      clientRef.current = null;
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
        } catch { }
        subscriptionRef.current = null;
      }
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
      debug: () => { },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        isConnectingRef.current = false;
        if (!clientRef.current?.connected) return;
        const destination = `/topic/user/${userId}/focus-notification`;
        subscriptionRef.current = clientRef.current.subscribe(
          destination,
          (message: IMessage) => {
            try {
              const notification: FocusNotificationMessage =
                JSON.parse(message.body);
              onNotificationRef.current?.(notification);
            } catch (error) {
            }
          },
          { id: `sub-focus-notification-${userId}-${Date.now()}` }
        );
      },
      onStompError: () => {
        isConnectingRef.current = false;
        subscriptionRef.current = null;
      },
      onWebSocketClose: () => {
        isConnectingRef.current = false;
        subscriptionRef.current = null;
      },
      onDisconnect: () => {
        isConnectingRef.current = false;
        subscriptionRef.current = null;
      },
    });

    clientRef.current = client;
    client.activate();
  }, [userId, token, shouldConnect]);

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch { }
      subscriptionRef.current = null;
    }
    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch { }
      clientRef.current = null;
    }
  }, []);

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

  useEffect(() => {
    if (options?.enabled === false) {
      disconnect();
      return;
    }
    if (userId && shouldConnect) {
      connect();
    } else {
      disconnect();
    }
    return () => {
      disconnect();
    };
  }, [userId, shouldConnect, connect, disconnect, options?.enabled, token]);
}
