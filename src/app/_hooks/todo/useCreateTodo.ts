"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  createTodo,
  type CreateTodoPayload,
} from "../../api/todos/api";
import { todoKeys } from "../../api/todos/keys";
import type { Todo } from "../../_types/todo";

export const useCreateTodo = (
  options?: UseMutationOptions<Todo, Error, CreateTodoPayload>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: createTodo,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.invalidateQueries({ queryKey: todoKeys.today() });
      qc.invalidateQueries({ queryKey: todoKeys.my() });
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("할일 생성에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

