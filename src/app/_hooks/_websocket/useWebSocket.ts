"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import {
  createWebSocketClient,
  subscribeToTopic,
  type WebSocketClientConfig,
} from "@/app/api/websocket/api";

export type UseWebSocketOptions<T = IMessage> = {
  enabled?: boolean;
  destination?: string;
  onMessage?: (message: T) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: unknown) => void;
  parseMessage?: (body: string) => T;
  config?: Partial<WebSocketClientConfig>;
};

/**
 * 웹소켓 연결을 관리하는 공통 훅
 * 각 웹소켓 훅에서 재사용할 수 있는 베이스 훅
 */
export function useWebSocket<T = IMessage>({
  enabled = true,
  destination,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  parseMessage,
  config = {},
}: UseWebSocketOptions<T>) {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<ReturnType<typeof subscribeToTopic> | null>(null);
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);

  // ref 업데이트
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onConnectRef.current = onConnect;
  }, [onConnect]);

  useEffect(() => {
    onDisconnectRef.current = onDisconnect;
  }, [onDisconnect]);

  const handleMessage = useCallback(
    (message: IMessage) => {
      try {
        const parsed = parseMessage
          ? parseMessage(message.body)
          : (JSON.parse(message.body) as T);
        onMessageRef.current?.(parsed);
      } catch (error) {
        onError?.(error);
      }
    },
    [parseMessage, onError]
  );

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch {
        // 구독 해제 실패 무시
      }
      subscriptionRef.current = null;
    }

    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch {
        // 연결 해제 실패 무시
      }
      clientRef.current = null;
    }

    setIsConnected(false);
    onDisconnectRef.current?.();
  }, []);

  const connect = useCallback(async () => {
    if (!enabled) return;

    // 기존 연결 정리
    if (clientRef.current) {
      disconnect();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    try {
      const wsConfig: WebSocketClientConfig = {
        onConnect: () => {
          setIsConnected(true);
          onConnectRef.current?.();

          // destination이 있으면 구독
          if (destination && clientRef.current) {
            subscriptionRef.current = subscribeToTopic(
              clientRef.current,
              destination,
              handleMessage
            );
          }
        },
        onStompError: (frame) => {
          setIsConnected(false);
          onError?.(frame);
        },
        onWebSocketClose: () => {
          setIsConnected(false);
        },
        onDisconnect: () => {
          setIsConnected(false);
        },
        ...config,
      };

      const { client, connect: connectClient } = await createWebSocketClient(wsConfig);
      clientRef.current = client;
      await connectClient();
    } catch (error) {
      setIsConnected(false);
      onError?.(error);
    }
  }, [enabled, destination, handleMessage, disconnect, config, onError]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    isConnected,
    connect,
    disconnect,
    client: clientRef.current,
  };
}

