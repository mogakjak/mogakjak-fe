"use client";

import { useTodayTodos } from "./useTodayTodos";
import { useCreateTodo } from "./useCreateTodo";
import { useUpdateTodo } from "./useUpdateTodo";
import { useToggleTodoComplete } from "./useToggleTodoComplete";
import { useDeleteTodo } from "./useDeleteTodo";

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

