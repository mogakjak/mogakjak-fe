"use client";

import { useState } from "react";
import { useAuthState } from "../auth/useAuthState";

export function useCreatePrivateRoom() {
  const { isLoggedIn, ready } = useAuthState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPrivateRoom = async (otherMemberId: string): Promise<string | null> => {
    if (!ready || !isLoggedIn) {
      setError("로그인이 필요합니다.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat/rooms/private/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otherMemberId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ""}`
        );
      }

      const data = await response.json();
      return data.roomId;
    } catch (err) {
      console.error("Failed to create private room:", err);
      setError(
        err instanceof Error ? err.message : "채팅방 생성에 실패했습니다."
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPrivateRoom,
    loading,
    error,
  };
}

