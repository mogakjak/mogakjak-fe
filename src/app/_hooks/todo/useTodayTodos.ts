"use client";

import {
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { getTodayTodos } from "../../api/todos/api";
import { todoKeys } from "../../api/todos/keys";
import type { TodoCategoryWithTodos } from "../../_types/todo";

export const useTodayTodos = (
  options?: Omit<UseQueryOptions<TodoCategoryWithTodos[], Error>, "queryKey" | "queryFn">
) =>
  useQuery<TodoCategoryWithTodos[], Error>({
    queryKey: todoKeys.today(),
    queryFn: getTodayTodos,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });

