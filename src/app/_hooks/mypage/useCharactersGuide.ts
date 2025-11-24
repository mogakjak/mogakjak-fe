"use client";

import { useQuery } from "@tanstack/react-query";
import { getCharactersGuide } from "../../api/mypage/api";
import { mypageKeys } from "../../api/mypage/keys";
import type { CharacterGuideItem } from "../../_types/mypage";

export const useCharactersGuide = () =>
  useQuery<CharacterGuideItem[]>({
    queryKey: mypageKeys.guide(),
    queryFn: getCharactersGuide,
    staleTime: 5 * 60 * 1000,
  });

