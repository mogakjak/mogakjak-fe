"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  updateTodo,
  type UpdateTodoPayload,
} from "../../api/todos/api";
import { todoKeys } from "../../api/todos/keys";
import type { Todo } from "../../_types/todo";

export const useUpdateTodo = (
  options?: UseMutationOptions<Todo, Error, { todoId: string; payload: UpdateTodoPayload }>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: ({ todoId, payload }) => updateTodo(todoId, payload),
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.invalidateQueries({ queryKey: todoKeys.today() });
      qc.invalidateQueries({ queryKey: todoKeys.my() });
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("할일 수정에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

