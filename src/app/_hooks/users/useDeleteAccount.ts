"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAccount } from "../../api/users/api";
import { invalidateTokenCache } from "../../api/auth/api";

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.clear();
      invalidateTokenCache();
      setTimeout(() => {
        window.location.replace("/login");
      }, 0);
    },
    onError: (error) => {
      console.error("계정 탈퇴에 실패했습니다.", error);
    },
  });
};

