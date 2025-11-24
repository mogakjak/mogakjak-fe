"use client";

import { useQuery } from "@tanstack/react-query";
import { getCharacterBasket } from "../../api/mypage/api";
import { mypageKeys } from "../../api/mypage/keys";
import type { CharacterBasket } from "../../_types/mypage";

export const useCharacterBasket = () =>
  useQuery<CharacterBasket>({
    queryKey: mypageKeys.basket(),
    queryFn: getCharacterBasket,
    staleTime: 5 * 60 * 1000,
  });

