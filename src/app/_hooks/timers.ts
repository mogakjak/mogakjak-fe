"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  startPomodoro,
  pauseTimer,
  resumeTimer,
  finishTimer,
  startTimer,
  startStopwatch,
  finishActiveTimer,
  nextPomodoro,
  type PomodoroSession,
  type StartPomodoroPayload,
  type StartTimerPayload,
  type StartStopwatchPayload,
} from "../api/timers/api";
import { timerKeys } from "../api/timers/keys";

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

export const useFinishActiveTimer = (
  options?: UseMutationOptions<PomodoroSession, Error, void>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: finishActiveTimer,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.setQueryData(timerKeys.current(), data);
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("활성 타이머 종료에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

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

