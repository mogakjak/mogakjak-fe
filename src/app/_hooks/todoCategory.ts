"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  createTodoCategory,
  deleteTodoCategory,
  getTodoCategories,
  reorderTodoCategories,
  updateTodoCategory,
  type CreateTodoCategoryPayload,
  type ReorderTodoCategoriesPayload,
  type UpdateTodoCategoryPayload,
} from "../api/todos/categories/api";
import { todoCategoryKeys } from "../api/todos/categories/keys";
import { todoKeys } from "../api/todos/keys";
import type { TodoCategory, TodoCategoryColor } from "../api/todos/categories/types";
import type { CategoryColorToken } from "../_types/category";

export const CATEGORY_COLOR_TOKEN_BY_NAME: Record<TodoCategoryColor, CategoryColorToken> = {
  RED: "category-1-red",
  ORANGE: "category-2-orange",
  YELLOW: "category-3-yellow",
  GREEN: "category-4-green",
  BLUE: "category-5-skyblue",
  INDIGO: "category-6-blue",
  PURPLE: "category-7-purple",
};

export const CATEGORY_COLOR_TOKENS = Object.values(CATEGORY_COLOR_TOKEN_BY_NAME);

export const CATEGORY_COLOR_NAME_BY_TOKEN = Object.entries(
  CATEGORY_COLOR_TOKEN_BY_NAME,
).reduce<Record<string, TodoCategoryColor>>((acc, [name, token]) => {
  acc[token] = name as TodoCategoryColor;
  return acc;
}, {});

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

export const useTodoCategoryController = () => {
  const { data: categories = [], isLoading, isError, error } = useTodoCategories();
  const createMutation = useCreateTodoCategory();
  const deleteMutation = useDeleteTodoCategory();
  const reorderMutation = useReorderTodoCategories();

  return {
    categories,
    isLoading,
    isError,
    error,
    createCategory: createMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    reorderCategories: reorderMutation.mutateAsync,
    createStatus: createMutation.status,
    deleteStatus: deleteMutation.status,
    reorderStatus: reorderMutation.status,
  };
};

