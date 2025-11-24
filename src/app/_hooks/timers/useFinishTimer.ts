"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { finishTimer, type PomodoroSession } from "../../api/timers/api";
import { timerKeys } from "../../api/timers/keys";

export const useFinishTimer = (
  options?: UseMutationOptions<PomodoroSession, Error, string>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: finishTimer,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.setQueryData(timerKeys.current(), data);
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("타이머 종료에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

