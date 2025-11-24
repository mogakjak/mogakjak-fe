"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { resumeTimer, type PomodoroSession } from "../../api/timers/api";
import { timerKeys } from "../../api/timers/keys";

export const useResumeTimer = (
  options?: UseMutationOptions<PomodoroSession, Error, string>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: resumeTimer,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.setQueryData(timerKeys.current(), data);
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("타이머 재개에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

