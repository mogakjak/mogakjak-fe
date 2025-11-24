"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  startGroupTimer,
  type StartGroupTimerPayload,
} from "../../api/timers/api";
import { timerKeys } from "../../api/timers/keys";

// 그룹 타이머
export const useStartGroupTimer = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StartGroupTimerPayload) =>
      startGroupTimer(groupId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timerKeys.group(groupId) });
    },
  });
};

