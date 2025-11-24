"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchProfile } from "../../api/mypage/api";
import { mypageKeys } from "../../api/mypage/keys";

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patchProfile,
    onSuccess: () => {
      return Promise.all([
        qc.invalidateQueries({ queryKey: mypageKeys.basket() }),
        qc.invalidateQueries({ queryKey: mypageKeys.profile() }),
      ]);
    },
    onError: (error) => {
      console.error("프로필 업데이트에 실패했습니다.", error);
    },
  });
};

