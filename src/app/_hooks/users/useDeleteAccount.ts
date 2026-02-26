"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAccount } from "../../api/users/api";
import { invalidateTokenCache } from "../../api/auth/api";

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      queryClient.clear();
      invalidateTokenCache();

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (e) {
        console.error("쿠키 삭제 요청 실패:", e);
      } finally {
        window.location.replace("/login");
      }
    },
    onError: (error) => {
      console.error("계정 탈퇴에 실패했습니다.", error);
    },
  });
};

