"use client";

import { useQuery } from "@tanstack/react-query";
import { getCommonGroups } from "../../api/groups/api";
import type { CommonGroup } from "../../_types/groups";

// 콕 찌르기
export const useCommonGroups = (targetUserId: string) => {
  return useQuery<CommonGroup[], unknown>({
    queryKey: ["common-groups", targetUserId],
    queryFn: () => getCommonGroups(targetUserId),
    enabled: !!targetUserId,
    staleTime: 30 * 1000,
  });
};

