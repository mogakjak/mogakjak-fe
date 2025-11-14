"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "../auth/useAuthState";

export interface User {
  id: string;
  name: string;
  email: string;
}

export function useUsers() {
  const { isLoggedIn, ready } = useAuthState();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!ready || !isLoggedIn) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users/list", {
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
      // 응답이 이미 배열이거나 { data: [...] } 형태일 수 있음
      const usersList = Array.isArray(data) ? data : data.data || [];
      setUsers(usersList);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("백엔드 서버에 연결할 수 없습니다.");
      } else {
        setError(
          err instanceof Error ? err.message : "사용자 목록을 불러오는데 실패했습니다."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && isLoggedIn) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isLoggedIn]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
}

