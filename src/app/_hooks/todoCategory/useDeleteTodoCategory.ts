"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { deleteTodoCategory } from "../../api/todos/categories/api";
import { todoCategoryKeys } from "../../api/todos/categories/keys";

export const useDeleteTodoCategory = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: deleteTodoCategory,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.invalidateQueries({ queryKey: todoCategoryKeys.list() });
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("카테고리 삭제에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

