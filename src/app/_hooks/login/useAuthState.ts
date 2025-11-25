"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "../../api/auth/getAuthToken";

const AUTH_QUERY_KEY = ["auth", "token"];

export function useAuthState() {
  const queryClient = useQueryClient();

  const {
    data: token,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getAuthToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  const invalidateAuth = () => {
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
  };

  const setAuthToken = (newToken: string | null) => {
    queryClient.setQueryData(AUTH_QUERY_KEY, newToken);
  };

  return {
    isLoggedIn: !!token && !error,
    ready: !isLoading,
    token,
    invalidateAuth,
    setAuthToken,
  };
}
