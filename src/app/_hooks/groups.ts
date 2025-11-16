"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  createGroup,
  getGroupDetail,
  getMates,
  GetMatesParams,
  getMyGroups,
  updateGroup,
} from "../api/groups/api";
import {
  CreateGroupBody,
  GroupDetail,
  MatesPage,
  MyGroup,
} from "../_types/groups";
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

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GroupDetail,
    Error,
    { groupId: string; body: CreateGroupBody }
  >({
    mutationFn: ({ groupId, body }) => updateGroup(groupId, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.detail(data.groupId),
      });
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    },
  });
};

export const useGroupDetail = (
  groupId: string,
  options?: Omit<UseQueryOptions<GroupDetail, Error>, "queryKey" | "queryFn">
) =>
  useQuery<GroupDetail, Error>({
    queryKey: groupKeys.detail(groupId),
    queryFn: () => getGroupDetail(groupId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
