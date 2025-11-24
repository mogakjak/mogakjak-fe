"use client";

import { useTodoCategories } from "./useTodoCategories";
import { useCreateTodoCategory } from "./useCreateTodoCategory";
import { useDeleteTodoCategory } from "./useDeleteTodoCategory";
import { useReorderTodoCategories } from "./useReorderTodoCategories";

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

