"use client";

import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getCharacterBasket,
  getCharactersGuide,
  patchCharacter,
  patchProfile,
} from "../api/mypage/api";
import { mypageKeys } from "../api/mypage/keys";
import type {
  CharacterUpdate,
  ProfileUpdate,
  CharacterBasket,
  CharacterGuideItem,
} from "../_types/mypage";

export const useCharactersGuide = () =>
  useSuspenseQuery<CharacterGuideItem[]>({
    queryKey: mypageKeys.guide(),
    queryFn: getCharactersGuide,
    staleTime: 5 * 60 * 1000,
  });

export const useCharacterBasket = () =>
  useSuspenseQuery<CharacterBasket>({
    queryKey: mypageKeys.basket(),
    queryFn: getCharacterBasket,
    staleTime: 5 * 60 * 1000,
  });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patchProfile,
    onSuccess: () => {
      return qc.invalidateQueries({ queryKey: mypageKeys.basket() });
    },
    onError: (error) => {
      console.error("프로필 업데이트에 실패했습니다.", error);
    },
  });
};

export const useUpdateCharacter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patchCharacter,
    onSuccess: () => {
      return Promise.all([
        qc.invalidateQueries({ queryKey: mypageKeys.basket() }),
        qc.invalidateQueries({ queryKey: mypageKeys.guide() }),
      ]);
    },
    onError: (error) => {
      console.error("캐릭터 업데이트에 실패했습니다.", error);
    },
  });
};
