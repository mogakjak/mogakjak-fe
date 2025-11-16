"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getMates, GetMatesParams, getMyGroups } from "../api/groups/api";
import { MatesPage, MyGroup } from "../_types/groups";
import { groupKeys } from "../api/groups/keys";

export const useMyGroups = (
  options?: Omit<UseQueryOptions<MyGroup[], Error>, "queryKey" | "queryFn">
) =>
  useQuery<MyGroup[], Error>({
    queryKey: groupKeys.my(),
    queryFn: getMyGroups,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useMates = (
  params?: GetMatesParams,
  options?: Omit<UseQueryOptions<MatesPage, Error>, "queryKey" | "queryFn">
) =>
  useQuery<MatesPage, Error>({
    queryKey: groupKeys.mates(params),
    queryFn: () => getMates(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
