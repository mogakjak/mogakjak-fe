"use client";

import {
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { getMyGroups } from "../../api/groups/api";
import { groupKeys } from "../../api/groups/keys";
import type { MyGroup } from "../../_types/groups";

export const useMyGroups = (
  options?: Omit<UseQueryOptions<MyGroup[], Error>, "queryKey" | "queryFn">
) =>
  useQuery<MyGroup[], Error>({
    queryKey: groupKeys.my(),
    queryFn: getMyGroups,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

