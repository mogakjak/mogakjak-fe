"use client";

import {
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  getMates,
  GetMatesParams,
} from "../../api/groups/api";
import { groupKeys } from "../../api/groups/keys";
import type { MatesPage } from "../../_types/groups";

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

