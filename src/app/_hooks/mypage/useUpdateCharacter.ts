"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchCharacter } from "../../api/mypage/api";
import { mypageKeys } from "../../api/mypage/keys";

export const useUpdateCharacter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patchCharacter,
    onSuccess: () => {
      return Promise.all([
        qc.invalidateQueries({ queryKey: mypageKeys.basket() }),
        qc.invalidateQueries({ queryKey: mypageKeys.guide() }),
        qc.invalidateQueries({ queryKey: mypageKeys.profile() }),
      ]);
    },
    onError: (error) => {
      console.error("캐릭터 업데이트에 실패했습니다.", error);
    },
  });
};

