"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  reorderTodoCategories,
  type ReorderTodoCategoriesPayload,
} from "../../api/todos/categories/api";
import { todoCategoryKeys } from "../../api/todos/categories/keys";

export const useReorderTodoCategories = (
  options?: UseMutationOptions<void, Error, ReorderTodoCategoriesPayload>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: reorderTodoCategories,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.invalidateQueries({ queryKey: todoCategoryKeys.list() });
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("카테고리 순서 변경에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

