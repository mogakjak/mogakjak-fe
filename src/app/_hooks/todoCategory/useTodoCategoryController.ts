"use client";

import { useEffect, useRef } from "react";
import { useTodoCategories } from "./useTodoCategories";
import { useCreateTodoCategory } from "./useCreateTodoCategory";
import { useDeleteTodoCategory } from "./useDeleteTodoCategory";
import { useReorderTodoCategories } from "./useReorderTodoCategories";

const DEFAULT_CATEGORY_NAME = "오늘 할 일";
const DEFAULT_CATEGORY_COLOR = "RED" as const;

export const useTodoCategoryController = () => {
  const { data: categories = [], isLoading, isError, error } = useTodoCategories();
  const createMutation = useCreateTodoCategory();
  const deleteMutation = useDeleteTodoCategory();
  const reorderMutation = useReorderTodoCategories();
  const hasCheckedDefaultCategory = useRef(false);
  const isCreatingDefaultCategory = useRef(false);

  useEffect(() => {
    if (isLoading || hasCheckedDefaultCategory.current || isCreatingDefaultCategory.current) return;
    const defaultCategories = categories.filter(
      (category) => category.name === DEFAULT_CATEGORY_NAME
    );  
    if (defaultCategories.length > 0) {
      hasCheckedDefaultCategory.current = true;
      return;
    } 
    if (!createMutation.isPending && !isCreatingDefaultCategory.current) {
      isCreatingDefaultCategory.current = true;
      hasCheckedDefaultCategory.current = true;
      
      createMutation.mutateAsync({
        name: DEFAULT_CATEGORY_NAME,
        color: DEFAULT_CATEGORY_COLOR,
      })
        .then(() => {
          isCreatingDefaultCategory.current = false;
        })
        .catch((error) => {
          console.error("기본 카테고리 생성 실패:", error);
          hasCheckedDefaultCategory.current = false; 
          isCreatingDefaultCategory.current = false;
        });
    }
  }, [categories, isLoading, createMutation]);

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

