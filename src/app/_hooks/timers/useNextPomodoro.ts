"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { nextPomodoro, type PomodoroSession } from "../../api/timers/api";
import { timerKeys } from "../../api/timers/keys";

export const useNextPomodoro = (
  options?: UseMutationOptions<PomodoroSession, Error, string>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: nextPomodoro,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.setQueryData(timerKeys.current(), data);
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("뽀모도로 다음 단계 전환에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

