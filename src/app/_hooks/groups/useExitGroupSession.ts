"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { exitGroupSession } from "../../api/groups/api";
import { groupKeys } from "../../api/groups/keys";

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

