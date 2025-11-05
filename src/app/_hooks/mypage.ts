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
    mutationFn: async (payload: ProfileUpdate) => {
      await patchProfile(payload);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: mypageKeys.basket() });
    },
  });
};

export const useUpdateCharacter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CharacterUpdate) => {
      await patchCharacter(payload);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: mypageKeys.basket() });
      await qc.invalidateQueries({ queryKey: mypageKeys.guide() });
    },
  });
};
