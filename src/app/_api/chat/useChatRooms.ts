"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "../auth/useAuthState";

export interface ChatRoom {
  roomId: string;
  roomName: string;
  isGroup: boolean;
  unreadCount?: number;
}

export function useChatRooms() {
  const { isLoggedIn, ready } = useAuthState();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupRooms = async () => {
    if (!ready || !isLoggedIn) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat/group-rooms", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ""}`
        );
      }

      const data = await response.json();
      setRooms(
        (data || []).map((room: { roomId: string; roomName?: string }) => ({
          roomId: String(room.roomId),
          roomName: room.roomName || "이름 없음",
          isGroup: true,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch group rooms:", err);
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError(
          `백엔드 서버에 연결할 수 없습니다. ${API_BASE_URL} 서버가 실행 중인지 확인해주세요.`
        );
      } else {
        setError(
          err instanceof Error ? err.message : "채팅방 목록을 불러오는데 실패했습니다."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRooms = async () => {
    if (!ready || !isLoggedIn) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat/rooms", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ""}`
        );
      }

      const data = await response.json();
      console.log("📋 [채팅방 목록] API 응답:", data);
      setRooms(
        (data || []).map(
          (room: {
            roomId: string;
            roomName?: string;
            isGroupChat?: string;
            isGroup?: boolean;
            unReadCount?: number;
            unreadCount?: number;
          }) => ({
            roomId: String(room.roomId),
            roomName: room.roomName || "이름 없음",
            isGroup: room.isGroupChat === "Y" || room.isGroup || false,
            unreadCount: room.unReadCount || room.unreadCount || 0,
          })
        )
      );
    } catch (err) {
      console.error("Failed to fetch my rooms:", err);
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError(
          `백엔드 서버에 연결할 수 없습니다. ${API_BASE_URL} 서버가 실행 중인지 확인해주세요.`
        );
      } else {
        setError(
          err instanceof Error ? err.message : "채팅방 목록을 불러오는데 실패했습니다."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && isLoggedIn) {
      fetchMyRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isLoggedIn]);

  return {
    rooms,
    loading,
    error,
    refetch: fetchMyRooms,
    fetchGroupRooms,
  };
}

