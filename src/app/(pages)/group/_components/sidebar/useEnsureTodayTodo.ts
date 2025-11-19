"use client";

import { useEffect, useState } from "react";
import type { Todo } from "@/app/_types/todo";
import type { AddWorkPayload } from "@/app/(pages)/todo/components/addWorkForm";
import type { TodoCategory } from "@/app/_types/todoCategory";
export const DEFAULT_TODO_TASK = "와이어프레임 완료";
export const DEFAULT_TODO_TARGET_TIME_IN_SECONDS = 3600;
interface UseEnsureTodayTodoOptions {
  todayTodo: Todo | null;
  categories: TodoCategory[];
  createTodo: (payload: {
    categoryId: string;
    task: string;
    date: string;
    targetTimeInSeconds: number;
  }) => Promise<Todo | null>;
  setCurrentTodo: (todo: Todo | null) => void;
  setSelectedWork: (work: AddWorkPayload | null) => void;
  setIsCreating: (isCreating: boolean) => void;
}

/**
 * 오늘의 할 일이 없을 때 기본 할 일을 생성하는 훅
 */
export function useEnsureTodayTodo({
  todayTodo,
  categories,
  createTodo,
  setCurrentTodo,
  setSelectedWork,
  setIsCreating,
}: UseEnsureTodayTodoOptions) {
  const [isCreatingLocal, setIsCreatingLocal] = useState(false);

  useEffect(() => {
    // 오늘의 할 일이 있고 생성 중이 아니면 종료
    if (todayTodo || categories.length === 0) {
      setIsCreating(false);
      setIsCreatingLocal(false);
      return;
    }

    // 이미 생성 중이면 중복 실행 방지
    if (isCreatingLocal) {
      return;
    }

    setIsCreating(true);
    setIsCreatingLocal(true);

    const ensureTodayTodo = async () => {
      try {
        const defaultCategory = categories[0];
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const formatted = `${yyyy}-${mm}-${dd}`;

        const createdTodo = await createTodo({
          categoryId: defaultCategory.id,
          task: DEFAULT_TODO_TASK,
          date: formatted,
          targetTimeInSeconds: DEFAULT_TODO_TARGET_TIME_IN_SECONDS,
        });

        if (createdTodo) {
          setCurrentTodo(createdTodo);
          const [year, month, day] = createdTodo.date.split("-").map(Number);
          setSelectedWork({
            categoryId: createdTodo.categoryId,
            title: createdTodo.task,
            date: new Date(year, month - 1, day),
            targetSeconds: createdTodo.targetTimeInSeconds,
          });
        }
      } catch (error) {
        console.error("오늘의 할 일 생성 실패:", error);
      } finally {
        setIsCreating(false);
        setIsCreatingLocal(false);
      }
    };

    ensureTodayTodo();
  }, [todayTodo, categories, createTodo, setIsCreating, setCurrentTodo, setSelectedWork, isCreatingLocal]);
}

