"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  createGroup,
  getMates,
  GetMatesParams,
  getMyGroups,
} from "../api/groups/api";
import { CreateGroupBody, MatesPage, MyGroup } from "../_types/groups";
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

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateGroupBody) => createGroup(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    },
  });
};
