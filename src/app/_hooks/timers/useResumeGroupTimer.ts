"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeGroupTimer } from "../../api/timers/api";
import { timerKeys } from "../../api/timers/keys";

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
  };
}

export const useResumeGroupTimer = (groupId: string, sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resumeGroupTimer(groupId, sessionId),
    onSuccess: createGroupTimerOnSuccess(queryClient, groupId, sessionId),
  });
};

