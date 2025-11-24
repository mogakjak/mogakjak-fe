"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { deleteTodo } from "../../api/todos/api";
import { todoKeys } from "../../api/todos/keys";

export const useDeleteTodo = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: deleteTodo,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.invalidateQueries({ queryKey: todoKeys.today() });
      qc.invalidateQueries({ queryKey: todoKeys.my() });
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("할일 삭제에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

