"use client";

import {
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { getMyTodos } from "../../api/todos/api";
import { todoKeys } from "../../api/todos/keys";
import type { Todo } from "../../_types/todo";

export const useMyTodos = (
  options?: Omit<UseQueryOptions<Todo[], Error>, "queryKey" | "queryFn">
) =>
  useQuery<Todo[], Error>({
    queryKey: todoKeys.my(),
    queryFn: getMyTodos,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });

