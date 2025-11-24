"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendCheer } from "../../api/groups/api";
import { groupKeys } from "../../api/groups/keys";
import type { CheerRequest } from "../../api/groups/api";

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

