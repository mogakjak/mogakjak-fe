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
  connectDelay?: number;
  waitForLoad?: boolean;
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
  connectDelay = 0,
  waitForLoad = false,
}: UseWebSocketOptions<T>) {
  const [isConnected, setIsConnected] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<ReturnType<typeof subscribeToTopic> | null>(
    null
  );
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

    if (clientRef.current?.connected || clientRef.current?.active) {
      return;
    }

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

      const { client, connect: connectClient } = await createWebSocketClient(
        wsConfig
      );
      clientRef.current = client;
      await connectClient();
    } catch (error) {
      setIsConnected(false);
      // 로그아웃 상태는 정상적인 경우이므로 에러 콜백을 호출하지 않음
      const isLogoutError =
        error instanceof Error && error.message.includes("로그아웃 상태");
      if (!isLogoutError) {
        onError?.(error);
      }
    }
  }, [enabled, destination, handleMessage, disconnect, config, onError]);

  useEffect(() => {
    if (!waitForLoad) {
      setShouldConnect(true);
      return;
    }

    if (typeof window === "undefined") {
      setShouldConnect(true);
      return;
    }

    if (document.readyState === "complete") {
      setShouldConnect(true);
      return;
    }

    const handleLoad = () => {
      setShouldConnect(true);
    };

    window.addEventListener("load", handleLoad);
    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, [waitForLoad]);

  useEffect(() => {
    if (!enabled || !shouldConnect) {
      disconnect();
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;

    if (connectDelay > 0) {
      timeoutId = setTimeout(() => {
        connect();
      }, connectDelay);
    } else {
      connect();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      disconnect();
    };
  }, [enabled, shouldConnect, connectDelay, connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
    client: clientRef.current,
  };
}
