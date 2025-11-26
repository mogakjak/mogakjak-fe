"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getGroupDetail } from "../../api/groups/api";
import { groupKeys } from "../../api/groups/keys";
import type { GroupDetail } from "../../_types/groups";

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
    // 목표는 그룹 타이머 종료 시에만 변경되므로 긴 캐시 시간 설정
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  });
