"use client";

import {
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { getTodoCategories } from "../../api/todos/categories/api";
import { todoCategoryKeys } from "../../api/todos/categories/keys";
import type { TodoCategory } from "../../_types/todoCategory";

export const useTodoCategories = (
  options?: Omit<UseQueryOptions<TodoCategory[], Error>, "queryKey" | "queryFn">
) =>
  useQuery<TodoCategory[], Error>({
    queryKey: todoCategoryKeys.list(),
    queryFn: getTodoCategories,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });

