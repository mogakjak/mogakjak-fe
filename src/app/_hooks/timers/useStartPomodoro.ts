"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  startPomodoro,
  type PomodoroSession,
  type StartPomodoroPayload,
} from "../../api/timers/api";
import { timerKeys } from "../../api/timers/keys";

export const useStartPomodoro = (
  options?: UseMutationOptions<PomodoroSession, Error, StartPomodoroPayload>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: startPomodoro,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      // todoId를 React Query에 저장
      qc.setQueryData(timerKeys.pomodoro(variables.todoId), data);
      qc.setQueryData(timerKeys.current(), data);
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("뽀모도로 시작에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

