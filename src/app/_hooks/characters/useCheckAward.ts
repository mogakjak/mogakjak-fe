import { useMutation } from "@tanstack/react-query";
import { postCheckAward } from "@/app/api/characters/api";
import { characterKeys } from "@/app/api/characters/keys";

export const useCheckAward = () =>
  useMutation({
    mutationKey: characterKeys.checkAward(),
    mutationFn: postCheckAward,
  });
