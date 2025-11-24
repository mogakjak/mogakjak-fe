"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  createTodoCategory,
  type CreateTodoCategoryPayload,
} from "../../api/todos/categories/api";
import { todoCategoryKeys } from "../../api/todos/categories/keys";
import { todoKeys } from "../../api/todos/keys";
import type { TodoCategory } from "../../_types/todoCategory";

export const useCreateTodoCategory = (
  options?: UseMutationOptions<TodoCategory, Error, CreateTodoCategoryPayload>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: createTodoCategory,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.invalidateQueries({ queryKey: todoCategoryKeys.list() });
      qc.invalidateQueries({ queryKey: todoKeys.today() });
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("카테고리 생성에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

