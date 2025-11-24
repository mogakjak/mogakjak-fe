"use client";

import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getTokenFromServer } from "@/app/api/auth/api";

/**
 * 웹소켓 URL을 생성합니다.
 * 프록시 설정을 고려하여 올바른 URL을 반환합니다.
 */
export function getWebSocketUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_PROXY;

  // 환경 변수가 없으면 프로덕션 URL 사용
  if (!apiBase) {
    return "https://mogakjak.site/connect";
  }

  // SockJS는 http/https를 사용하므로 변환하지 않음
  return `${apiBase}/connect`;
}

// getTokenFromServer는 인증 관련 함수이므로 /api/auth에서 import
export { getTokenFromServer } from "@/app/api/auth/api";

export type WebSocketClientConfig = {
  onConnect?: () => void;
  onStompError?: (frame: unknown) => void;
  onWebSocketClose?: () => void;
  onDisconnect?: () => void;
  debug?: (str: string) => void;
  reconnectDelay?: number;
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
};

/**
 * STOMP 웹소켓 클라이언트를 생성하고 연결합니다.
 * @param config 클라이언트 설정
 * @returns 생성된 클라이언트와 연결 함수
 */
export async function createWebSocketClient(
  config: WebSocketClientConfig = {}
): Promise<{
  client: Client;
  connect: () => Promise<void>;
}> {
  const token = await getTokenFromServer();

  if (!token) {
    throw new Error("[WebSocket] 토큰을 찾을 수 없습니다.");
  }

  const connectHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  const wsUrl = getWebSocketUrl();

  const client = new Client({
    webSocketFactory: () => {
      // SockJS는 WebSocket-like 인터페이스를 제공하므로 타입 단언 필요
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sock = new SockJS(wsUrl) as any;
      return sock;
    },
    connectHeaders,
    debug: config.debug || (() => {}),
    reconnectDelay: config.reconnectDelay ?? 5000,
    heartbeatIncoming: config.heartbeatIncoming ?? 4000,
    heartbeatOutgoing: config.heartbeatOutgoing ?? 4000,
    onConnect: () => {
      config.onConnect?.();
    },
    onStompError: (frame) => {
      config.onStompError?.(frame);
    },
    onWebSocketClose: () => {
      config.onWebSocketClose?.();
    },
    onDisconnect: () => {
      config.onDisconnect?.();
    },
  });

  const connect = async () => {
    client.activate();
  };

  return { client, connect };
}

/**
 * 웹소켓 메시지를 구독합니다.
 * @param client STOMP 클라이언트
 * @param destination 구독할 토픽 경로
 * @param handler 메시지 핸들러
 * @returns 구독 객체
 */
export function subscribeToTopic(
  client: Client,
  destination: string,
  handler: (message: IMessage) => void
) {
  return client.subscribe(destination, handler);
}
