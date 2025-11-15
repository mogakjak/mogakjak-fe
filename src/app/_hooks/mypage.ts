"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCharacterBasket,
  getCharactersGuide,
  getProfile,
  patchCharacter,
  patchProfile,
} from "../api/mypage/api";
import { mypageKeys } from "../api/mypage/keys";
import type {
  CharacterBasket,
  CharacterGuideItem,
  Profile,
} from "../_types/mypage";

export const useProfile = () =>
  useQuery<Profile>({
    queryKey: mypageKeys.profile(),
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000,
  });

export const useCharactersGuide = () =>
  useQuery<CharacterGuideItem[]>({
    queryKey: mypageKeys.guide(),
    queryFn: getCharactersGuide,
    staleTime: 5 * 60 * 1000,
  });

export const useCharacterBasket = () =>
  useQuery<CharacterBasket>({
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
