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
  putGroupGoal,
  putGroupNoti,
  updateGroup,
} from "../api/groups/api";
import {
  CreateGroupBody,
  GroupDetail,
  GroupGoalReq,
  GroupGoalRes,
  MatesPage,
  MyGroup,
  NotiReq,
  NotiRes,
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

export const useUpdateGroupNotifications = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotiReq) => putGroupNoti(groupId, payload),
    onSuccess: (data: NotiRes) => {
      queryClient.setQueryData(groupKeys.notifications(groupId), data);
      queryClient.setQueryData<NotiRes | undefined>(
        groupKeys.detail(groupId),
        (prev) => (prev ? { ...prev, ...data } : data)
      );
    },
  });
};

export const useUpdateGroupGoal = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GroupGoalReq) => putGroupGoal(groupId, payload),

    onSuccess: (data: GroupGoalRes) => {
      queryClient.setQueryData(groupKeys.goal(groupId), data);
      queryClient.setQueryData<GroupDetail | undefined>(
        groupKeys.detail(groupId),
        (prev) =>
          prev
            ? {
                ...prev,
                goalHours: data.goalHours,
                goalMinutes: data.goalMinutes,
              }
            : prev
      );
    },
  });
};
