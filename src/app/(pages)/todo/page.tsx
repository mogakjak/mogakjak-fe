"use client";

import { useCallback, useMemo, useState } from "react";
import CategorySidebar, {
  type Category as CatType,
  type DayFilter,
} from "./components/category";
import TodoSection from "./components/todoSection";
import {
  CATEGORY_COLOR_NAME_BY_TOKEN,
  CATEGORY_COLOR_TOKEN_BY_NAME,
  useTodoCategoryController,
} from "@/app/_hooks/todoCategory";
import { useTodoController } from "@/app/_hooks/todo";
import type { Category as ListCategory } from "@/app/_types/category";

function getKoreanDateLabel(d = new Date()) {
  const days = ["일", "월", "화", "수", "목", "금", "토"] as const;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const day = days[d.getDay()];
  return `${yyyy}.${mm}.${dd}(${day})`;
}

export default function TodoPage() {
  const [filter, setFilter] = useState<DayFilter>("today");
  const [selectedId, setSelectedId] = useState<string>("all");
  const {
    categories,
    createCategory,
    deleteCategory,
    reorderCategories,
  } = useTodoCategoryController();
  const {
    todayTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
  } = useTodoController();

  const dateLabel = useMemo(() => getKoreanDateLabel(), []);
  const sidebarCategories = useMemo<CatType[]>(() => {
    return categories.map((category) => {
      const baseToken =
        CATEGORY_COLOR_TOKEN_BY_NAME[
          category.color as keyof typeof CATEGORY_COLOR_TOKEN_BY_NAME
        ] ?? "category-1-red";
      return {
        id: category.id,
        name: category.name,
        colorToken: baseToken,
        isNew: false,
      };
    });
  }, [categories]);

  const todoListCategories = useMemo<ListCategory[]>(() => {
    // todayTodos를 카테고리 ID로 매핑
    const todosByCategoryId = new Map(
      todayTodos.map((cat) => [cat.id, cat])
    );
    return categories
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((category) => {
        const categoryWithTodos = todosByCategoryId.get(category.id);
        const todos = categoryWithTodos?.todos ?? [];
        
        const baseToken =
          CATEGORY_COLOR_TOKEN_BY_NAME[
            category.color as keyof typeof CATEGORY_COLOR_TOKEN_BY_NAME
          ] ?? "category-1-red";
        const colorToken = `bg-${baseToken}`;
        
        return {
          id: category.id,
          title: category.name,
          barColorClass: colorToken,
          colorToken: baseToken,
          expanded: category.isExpanded ?? true,
          items: todos.map((todo) => ({
            id: todo.id,
            date: todo.date,
            title: todo.task,
            targetSeconds: todo.targetTimeInSeconds,
            currentSeconds: todo.actualTimeInSeconds,
            completed: todo.isCompleted,
          })),
        };
      });
  }, [categories, todayTodos]);

  const handleCreateCategory = useCallback(
    async ({ name, colorToken }: { name: string; colorToken: string }) => {
      const color = CATEGORY_COLOR_NAME_BY_TOKEN[colorToken] ?? "RED";
      const created = await createCategory({ name, color });
      return {
        id: created.id,
        name: created.name,
        colorToken: CATEGORY_COLOR_TOKEN_BY_NAME[created.color] ?? colorToken,
      };
    },
    [createCategory],
  );

  const handleDeleteCategory = useCallback(
    async (categoryId: string) => {
      await deleteCategory(categoryId);
    },
    [deleteCategory],
  );

  const handleReorderCategories = useCallback(
    async (categoryIds: string[]) => {
      if (categoryIds.length === 0) return;
      await reorderCategories({ categoryIds });
    },
    [reorderCategories],
  );

  const handleCreateTodo = useCallback(
    async ({
      categoryId,
      title,
      date,
      targetSeconds,
    }: {
      categoryId: string;
      title: string;
      date: Date;
      targetSeconds: number;
    }) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const formatted = `${yyyy}-${mm}-${dd}`;
      await createTodo({
        categoryId,
        task: title,
        date: formatted,
        targetTimeInSeconds: targetSeconds,
      });
    },
    [createTodo],
  );

  const handleUpdateTodo = useCallback(
    async ({
      todoId,
      categoryId,
      title,
      date,
      targetSeconds,
    }: {
      todoId: string;
      categoryId: string;
      title: string;
      date: Date;
      targetSeconds: number;
    }) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const formatted = `${yyyy}-${mm}-${dd}`;
      await updateTodo({
        todoId,
        payload: {
          categoryId,
          task: title,
          date: formatted,
          targetTimeInSeconds: targetSeconds,
        },
      });
    },
    [updateTodo],
  );

  const handleDeleteTodo = useCallback(
    async (todoId: string) => {
      if (!todoId) return;
      await deleteTodo(todoId);
    },
    [deleteTodo],
  );

  const handleToggleTodo = useCallback(
    async (todoId: string, next: boolean) => {
      if (!todoId) return;
      const category = todayTodos.find((cat) =>
        cat.todos.some((todo) => todo.id === todoId),
      );
      const current = category?.todos.find((todo) => todo.id === todoId)?.isCompleted;
      if (current === next) return;
      await toggleTodoComplete(todoId);
    },
    [todayTodos, toggleTodoComplete],
  );

  return (
    <main className="min-h-screen bg-gray-100 flex">
      <div className="shrink-0">
        <CategorySidebar
          filter={filter}
          onChangeFilter={setFilter}
          categories={sidebarCategories}
          selectedId={selectedId}
          onSelect={setSelectedId}
          className="mt-10 ml-10"
          onCreateCategory={handleCreateCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCategories={handleReorderCategories}
        />
      </div>

      <div className="flex-1 p-10">
        <TodoSection
          filter={filter}
          dateLabel={dateLabel}
          categories={todoListCategories}
          onCreateTodo={handleCreateTodo}
          onUpdateTodo={handleUpdateTodo}
          onDeleteTodo={handleDeleteTodo}
          onToggleTodo={handleToggleTodo}
          className="mb-6"
        />
      </div>
    </main>
  );
}
