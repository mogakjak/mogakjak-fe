"use client";

import { useEffect, useRef, useState } from "react";
import { getUserIdFromToken } from "@/app/_utils/jwt";
import { getTokenFromServer } from "@/app/api/websocket/api";
import { useWebSocket, type UseWebSocketOptions } from "./useWebSocket";

/**
 * userId가 필요한 웹소켓 훅을 위한 헬퍼
 * 토큰에서 userId를 추출하여 destination을 동적으로 생성
 */
export function useWebSocketWithUserId<T = unknown>(
  options: Omit<UseWebSocketOptions<T>, "destination"> & {
    getDestination: (userId: string) => string;
  }
) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await getTokenFromServer();
        if (!token) {
          setIsLoading(false);
          return;
        }

        const extractedUserId = getUserIdFromToken(token);
        if (extractedUserId) {
          setUserId(extractedUserId);
          userIdRef.current = extractedUserId;
        }
      } catch {
        // 토큰 가져오기 실패
      } finally {
        setIsLoading(false);
      }
    };

    if (options.enabled !== false) {
      fetchUserId();
    }
  }, [options.enabled]);

  const destination = userId ? options.getDestination(userId) : undefined;

  const wsResult = useWebSocket<T>({
    ...options,
    enabled: options.enabled !== false && !!userId && !isLoading,
    destination,
  });

  return {
    ...wsResult,
    userId: userIdRef.current,
    isLoading,
  };
}

