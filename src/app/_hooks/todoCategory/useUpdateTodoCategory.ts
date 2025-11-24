"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  updateTodoCategory,
  type UpdateTodoCategoryPayload,
} from "../../api/todos/categories/api";
import { todoCategoryKeys } from "../../api/todos/categories/keys";
import type { TodoCategory } from "../../_types/todoCategory";

export const useUpdateTodoCategory = (
  options?: UseMutationOptions<TodoCategory, Error, UpdateTodoCategoryPayload>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: updateTodoCategory,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.invalidateQueries({ queryKey: todoCategoryKeys.list() });
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("카테고리 수정에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

