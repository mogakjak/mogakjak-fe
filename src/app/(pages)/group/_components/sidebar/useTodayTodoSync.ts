"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { timerKeys } from "@/app/api/timers/keys";
import type { Todo } from "@/app/_types/todo";
import type { AddWorkPayload } from "@/app/(pages)/todo/components/addWorkForm";

interface UseTodayTodoSyncOptions {
  todayTodo: Todo | null;
  selectedTodoId: string | null;
  setCurrentTodo: (todo: Todo | null) => void;
  setSelectedWork: (work: AddWorkPayload | null) => void;
  setSelectedTodoId: (id: string | null) => void;
}

/**
 * 오늘의 할 일이 있을 때 상태를 동기화하는 훅
 */
export function useTodayTodoSync({
  todayTodo,
  selectedTodoId,
  setCurrentTodo,
  setSelectedWork,
  setSelectedTodoId,
}: UseTodayTodoSyncOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!todayTodo) return;

    // selectedTodoId가 없거나 현재 todayTodo와 일치하는 경우에만 동기화
    if (!selectedTodoId || todayTodo.id === selectedTodoId) {
      setCurrentTodo(todayTodo);

      const [year, month, day] = todayTodo.date.split("-").map(Number);
      setSelectedWork({
        categoryId: todayTodo.categoryId,
        title: todayTodo.task,
        date: new Date(year, month - 1, day),
        targetSeconds: todayTodo.targetTimeInSeconds,
      });

      // selectedTodoId가 없으면 초기 설정
      if (!selectedTodoId) {
        if (typeof window !== "undefined") {
          localStorage.setItem("groupMySidebar_selectedTodoId", todayTodo.id);
        }
        setSelectedTodoId(todayTodo.id);

        // React Query에 타이머용 데이터 저장
        queryClient.setQueryData(timerKeys.pomodoro(todayTodo.id), {
          todo: {
            id: todayTodo.id,
            task: todayTodo.task,
            targetTimeInSeconds: todayTodo.targetTimeInSeconds,
          },
        });
      }
    }
  }, [todayTodo, selectedTodoId, setCurrentTodo, setSelectedWork, setSelectedTodoId, queryClient]);
}

