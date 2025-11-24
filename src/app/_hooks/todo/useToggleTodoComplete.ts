"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { toggleTodoComplete } from "../../api/todos/api";
import { todoKeys } from "../../api/todos/keys";
import type { Todo } from "../../_types/todo";

export const useToggleTodoComplete = (
  options?: UseMutationOptions<Todo, Error, string>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: toggleTodoComplete,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.invalidateQueries({ queryKey: todoKeys.today() });
      qc.invalidateQueries({ queryKey: todoKeys.my() });
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("할일 완료 상태 변경에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

