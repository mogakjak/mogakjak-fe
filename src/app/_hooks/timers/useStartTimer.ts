"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  startTimer,
  type PomodoroSession,
  type StartTimerPayload,
} from "../../api/timers/api";
import { timerKeys } from "../../api/timers/keys";

export const useStartTimer = (
  options?: UseMutationOptions<PomodoroSession, Error, StartTimerPayload>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: startTimer,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.setQueryData(timerKeys.current(), data);
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("타이머 시작에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

