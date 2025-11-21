"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  createGroup,
  exitGroupSession,
  getGroupDetail,
  getMates,
  GetMatesParams,
  getMyGroups,
  joinGroup,
  leaveGroup,
  postGroupInvitation,
  putGroupGoal,
  putGroupNoti,
  updateGroup,
  getCommonGroups,
  sendPokeNotification,
  sendCheer,
  CheerRequest,
} from "../api/groups/api";
import {
  CreateGroupBody,
  GroupDetail,
  GroupGoalReq,
  GroupGoalRes,
  InviteRequest,
  MatesPage,
  MyGroup,
  NotiReq,
  NotiRes,
  CommonGroup,
  PokeRequest,
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
    queryFn: () => {
      if (!groupId || groupId === "undefined") {
        throw new Error("groupId is required");
      }
      console.log(
        "[useGroupDetail] 그룹 상세 정보 조회 시작, groupId:",
        groupId
      );
      return getGroupDetail(groupId);
    },
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

// 그룹 탈퇴
export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (groupId: string) => leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    },
  });
};

// 초대
export const useInviteMate = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: InviteRequest) => postGroupInvitation(groupId, body),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({
        queryKey: groupKeys.invitations(groupId),
      });
    },
  });
};

export const useJoinGroup = () =>
  useMutation<void, Error, string>({
    mutationFn: (groupId: string) => joinGroup(groupId),
  });

// 그룹 나가기
export const useExitGroupSession = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: exitGroupSession,
    onSuccess: (_, groupId) => {
      // 세션을 나간 후에는 그룹 상세 정보를 다시 가져올 필요가 없으므로
      // 쿼리를 제거하거나 무효화하되 refetch는 하지 않음
      queryClient.removeQueries({
        queryKey: groupKeys.detail(groupId),
      });
      // 내 그룹 목록은 업데이트 필요
      queryClient.invalidateQueries({
        queryKey: groupKeys.my(),
        refetchType: "none",
      });
    },
    onError: (error, groupId) => {
      console.error(
        "[useExitGroupSession] 세션 나가기 실패:",
        error,
        "groupId:",
        groupId
      );
    },
  });
};

// 콕 찌르기
export const useCommonGroups = (targetUserId: string) => {
  return useQuery<CommonGroup[], unknown>({
    queryKey: ["common-groups", targetUserId],
    queryFn: () => getCommonGroups(targetUserId),
    enabled: !!targetUserId,
    staleTime: 30 * 1000,
  });
};

export const usePoke = () => {
  return useMutation<unknown, unknown, PokeRequest>({
    mutationFn: (body: PokeRequest) => sendPokeNotification(body),
  });
};

// 응원 보내기
export const useSendCheer = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, CheerRequest>({
    mutationFn: (body: CheerRequest) => sendCheer(groupId, body),
    onSuccess: () => {
      // 그룹 상세 정보 캐시 무효화 (응원 수 업데이트 반영)
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    },
  });
};
