"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getOfficialLoungeSummary } from "@/app/api/lounge/api";
import { loungeKeys } from "@/app/api/lounge/keys";
import type { MyGroup } from "@/app/_types/groups";

export const useOfficialLoungeSummary = (
  options?: Omit<UseQueryOptions<MyGroup, Error>, "queryKey" | "queryFn">
) =>
  useQuery<MyGroup, Error>({
    queryKey: loungeKeys.summary(),
    queryFn: getOfficialLoungeSummary,
    staleTime: 30 * 1000,
    refetchInterval: options?.refetchInterval ?? false,
    ...options,
  });
