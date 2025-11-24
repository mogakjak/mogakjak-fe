"use client";

import { useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
  getWebSocketUrl,
  getTokenFromServer,
  subscribeToTopic,
} from "@/app/api/websocket/api";

export type UserActiveStatusEvent = {
  userId: string;
  isActive: boolean;
};

type UseMateActiveStatusOptions = {
  enabled?: boolean;
  onStatusChange?: (event: UserActiveStatusEvent) => void;
};

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
        onConnect: () => {
          setIsConnected(true);

          // 메이트 isActive 상태 변경 구독
          subscribeToTopic(
            client,
            "/topic/mates/active-status",
            (message: IMessage) => {
              try {
                const event: UserActiveStatusEvent = JSON.parse(message.body);
                if (onStatusChangeRef.current) {
                  onStatusChangeRef.current(event);
                }
              } catch {
                // 메시지 파싱 실패
              }
            }
          );
        },
        onStompError: () => {
          setIsConnected(false);
        },
        onWebSocketError: () => {
          // WebSocket 에러
        },
        onWebSocketClose: () => {
          setIsConnected(false);
        },
        onDisconnect: () => {
          setIsConnected(false);
        },
        debug: () => {
          // STOMP 디버그
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

