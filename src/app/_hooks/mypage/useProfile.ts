"use client";

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../../api/mypage/api";
import { mypageKeys } from "../../api/mypage/keys";
import type { Profile } from "../../_types/mypage";

export const useProfile = () =>
  useQuery<Profile>({
    queryKey: mypageKeys.profile(),
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000,
  });

