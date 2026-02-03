"use client";

import { useState } from "react";
import type { Category } from "@/app/_types/category";

type DraggedTodo = {
  todoId: string;
  categoryId: string;
  title: string;
};

type UseTodoDragAndDropProps = {
  categories: Category[];
  onUpdateTodo?: (payload: {
    todoId: string;
    categoryId: string;
    title: string;
    date: Date;
    targetSeconds: number;
  }) => Promise<void> | void;
  onToast?: (message: string) => void;
};

export const useTodoDragAndDrop = ({
  categories,
  onUpdateTodo,
  onToast,
}: UseTodoDragAndDropProps) => {
  const [draggedTodo, setDraggedTodo] = useState<DraggedTodo | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | number | null>(null);

  const handleDragStart = (todoId: string, categoryId: string) => {
    const todo = categories
      .find((cat) => String(cat.id) === categoryId)
      ?.items.find((item) => item.id === todoId);
    if (todo) {
      setDraggedTodo({
        todoId,
        categoryId,
        title: todo.title,
      });
    }
  };

  const handleDragEnd = () => {
    setDraggedTodo(null);
    setDragOverCategoryId(null);
  };

  const handleDropOnCategory = async (e: React.DragEvent, targetCategoryId: string | number) => {
    e.preventDefault();
    if (!draggedTodo) return;

    const sourceCategoryId = draggedTodo.categoryId;
    const targetCategoryIdStr = String(targetCategoryId);

    // 같은 카테고리로 이동하는 경우 무시
    if (sourceCategoryId === targetCategoryIdStr) {
      setDragOverCategoryId(null);
      return;
    }

    const todo = categories
      .find((cat) => String(cat.id) === sourceCategoryId)
      ?.items.find((item) => item.id === draggedTodo.todoId);

    if (!todo || !todo.id) {
      setDragOverCategoryId(null);
      return;
    }

    let todoDate: Date;
    if (typeof todo.date === "string") {
      const [year, month, day] = todo.date.split("-").map(Number);
      todoDate = new Date(year, month - 1, day);
    } else {
      todoDate = todo.date;
    }

    await onUpdateTodo?.({
      todoId: todo.id,
      categoryId: targetCategoryIdStr,
      title: todo.title,
      date: todoDate,
      targetSeconds: todo.targetSeconds,
    });

    const displayTitle = todo.title.length > 15 ? todo.title.slice(0, 15) + "..." : todo.title;
    const targetCategory = categories.find((cat) => String(cat.id) === targetCategoryIdStr);
    onToast?.(`${displayTitle}을 ${targetCategory?.title || "다른 카테고리"}로 이동했습니다.`);

    setDragOverCategoryId(null);
    setDraggedTodo(null);
  };

  return {
    draggedTodo,
    dragOverCategoryId,
    setDragOverCategoryId,
    handleDragStart,
    handleDragEnd,
    handleDropOnCategory,
  };
};

