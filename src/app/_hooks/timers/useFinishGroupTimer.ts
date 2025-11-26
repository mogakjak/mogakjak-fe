"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { finishGroupTimer } from "../../api/timers/api";
import { timerKeys } from "../../api/timers/keys";
import { groupKeys } from "../../api/groups/keys";

// 그룹 타이머 공통 onSuccess 핸들러 생성 함수
function createGroupTimerOnSuccess(
  queryClient: ReturnType<typeof useQueryClient>,
  groupId: string,
  sessionId: string
) {
  return () => {
    queryClient.invalidateQueries({ queryKey: timerKeys.group(groupId) });
    queryClient.invalidateQueries({
      queryKey: timerKeys.groupSession(groupId, sessionId),
    });
    // 그룹 상세 정보를 invalidate하여 달성률 업데이트
    queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
  };
}

export const useFinishGroupTimer = (groupId: string, sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => finishGroupTimer(groupId, sessionId),
    onSuccess: createGroupTimerOnSuccess(queryClient, groupId, sessionId),
  });
};
