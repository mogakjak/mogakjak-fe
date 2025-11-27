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

export function useTodayTodoSync({
  todayTodo,
  selectedTodoId,
  setCurrentTodo,
  setSelectedWork,
}: UseTodayTodoSyncOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // selectedTodoId가 있고 todayTodo가 존재할 때만 동기화
    if (!selectedTodoId || !todayTodo) return;

    // selectedTodoId와 todayTodo.id가 일치하는 경우에만 동기화
      if (todayTodo.id === selectedTodoId) {
      setCurrentTodo({
        ...todayTodo,
        progressRate: todayTodo.progressRate, 
      });

      const [year, month, day] = todayTodo.date.split("-").map(Number);
      setSelectedWork({
        categoryId: todayTodo.categoryId,
        title: todayTodo.task,
        date: new Date(year, month - 1, day),
        targetSeconds: todayTodo.targetTimeInSeconds,
      });

      queryClient.setQueryData(timerKeys.pomodoro(todayTodo.id), {
        todo: {
          id: todayTodo.id,
          task: todayTodo.task,
          targetTimeInSeconds: todayTodo.targetTimeInSeconds,
        },
      });
    }
  }, [todayTodo, selectedTodoId, setCurrentTodo, setSelectedWork, queryClient]);
}

