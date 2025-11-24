"use client";

import {
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
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
    staleTime: 5 * 60 * 1000,
    ...options,
  });

