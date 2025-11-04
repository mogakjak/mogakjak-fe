import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCharacterBasket,
  getCharactersGuide,
  patchCharacter,
  patchProfile,
} from "./api";
import { mypageKeys } from "./keys";
import type { CharacterUpdate, ProfileUpdate } from "./types";

export const useCharactersGuide = () =>
  useQuery({
    queryKey: mypageKeys.guide(),
    queryFn: getCharactersGuide,
    staleTime: 5 * 60 * 1000,
  });

export const useCharacterBasket = () =>
  useQuery({
    queryKey: mypageKeys.basket(),
    queryFn: getCharacterBasket,
    staleTime: 60 * 1000,
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
