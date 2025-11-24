"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { pauseTimer, type PomodoroSession } from "../../api/timers/api";
import { timerKeys } from "../../api/timers/keys";

export const usePauseTimer = (
  options?: UseMutationOptions<PomodoroSession, Error, string>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: pauseTimer,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.setQueryData(timerKeys.current(), data);
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("타이머 정지에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

