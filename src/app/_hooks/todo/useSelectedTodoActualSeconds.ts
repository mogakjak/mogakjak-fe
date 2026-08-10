"use client";

import { useEffect, useMemo, useState } from "react";
import { useTodayTodos } from "@/app/_hooks/todo/useTodayTodos";
import { useTimer } from "@/app/_contexts/TimerContext";
import { useLiveTimer } from "@/app/_hooks/timers/useLiveTimer";
import type { Todo } from "@/app/_types/todo";

export function useSelectedTodoActualSeconds() {
  const { data: todayTodos = [] } = useTodayTodos();
  const { isRunning } = useTimer();
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("selectedTodoId");
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncTodoId = () => {
      setSelectedTodoId(localStorage.getItem("selectedTodoId"));
    };

    window.addEventListener("todoIdChanged", syncTodoId);
    window.addEventListener("storage", syncTodoId);
    return () => {
      window.removeEventListener("todoIdChanged", syncTodoId);
      window.removeEventListener("storage", syncTodoId);
    };
  }, []);

  const selectedTodo = useMemo<Todo | null>(() => {
    if (!selectedTodoId) return null;
    for (const category of todayTodos) {
      const found = category.todos.find((todo) => todo.id === selectedTodoId);
      if (found) return found;
    }
    return null;
  }, [todayTodos, selectedTodoId]);

  const serverSeconds = selectedTodo?.actualTimeInSeconds ?? 0;
  const liveSeconds = useLiveTimer({
    serverSeconds,
    isRunning,
    refreshKey: selectedTodo?.id,
  });

  return {
    todoId: selectedTodo?.id,
    taskTitle: selectedTodo?.task,
    actualSeconds: liveSeconds > 0 ? liveSeconds : serverSeconds,
    hasTodo: !!selectedTodo,
  };
}
