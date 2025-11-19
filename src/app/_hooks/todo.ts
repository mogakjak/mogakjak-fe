"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  createTodo,
  deleteTodo,
  getMyTodos,
  getTodayTodos,
  toggleTodoComplete,
  updateTodo,
  type CreateTodoPayload,
  type UpdateTodoPayload,
} from "../api/todos/api";
import { todoKeys } from "../api/todos/keys";
import type { Todo, TodoCategoryWithTodos } from "../_types/todo";

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

export const useUpdateTodo = (
  options?: UseMutationOptions<Todo, Error, { todoId: string; payload: UpdateTodoPayload }>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: ({ todoId, payload }) => updateTodo(todoId, payload),
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.invalidateQueries({ queryKey: todoKeys.today() });
      qc.invalidateQueries({ queryKey: todoKeys.my() });
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("할일 수정에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

export const useToggleTodoComplete = (
  options?: UseMutationOptions<Todo, Error, string>
) => {
  const qc = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: toggleTodoComplete,
    ...restOptions,
    onSuccess: (data, variables, context, mutation) => {
      qc.invalidateQueries({ queryKey: todoKeys.today() });
      qc.invalidateQueries({ queryKey: todoKeys.my() });
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("할일 완료 상태 변경에 실패했습니다.", error);
      onError?.(error, variables, context, mutation);
    },
  });
};

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

export const useTodoController = () => {
  const { data: todayTodos = [], isLoading, isError, error } = useTodayTodos();
  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();
  const toggleMutation = useToggleTodoComplete();
  const deleteMutation = useDeleteTodo();

  return {
    todayTodos,
    isLoading,
    isError,
    error,
    createTodo: createMutation.mutateAsync,
    updateTodo: updateMutation.mutateAsync,
    toggleTodoComplete: toggleMutation.mutateAsync,
    deleteTodo: deleteMutation.mutateAsync,
    createStatus: createMutation.status,
    updateStatus: updateMutation.status,
    toggleStatus: toggleMutation.status,
    deleteStatus: deleteMutation.status,
  };
};

