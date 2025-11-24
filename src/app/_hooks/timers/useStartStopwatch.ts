"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  startStopwatch,
  type PomodoroSession,
  type StartStopwatchPayload,
} from "../../api/timers/api";
import { timerKeys } from "../../api/timers/keys";

export const useStartStopwatch = (
  options?: UseMutationOptions<PomodoroSession, Error, StartStopwatchPayload>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: startStopwatch,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.setQueryData(timerKeys.current(), data);
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("스톱워치 시작에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

