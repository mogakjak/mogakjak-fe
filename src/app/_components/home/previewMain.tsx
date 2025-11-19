"use client";

import { useProfile } from "@/app/_hooks/mypage";
import { useQueryClient } from "@tanstack/react-query";
import TimerComponent from "../common/timer/timerComponent";
import GroupMySidebar from "../../(pages)/group/_components/sidebar/groupMySidebar";
import PreviewCharacter from "./preview/previewCharacter";
import Quotes from "./preview/quotes";
import { timerKeys } from "@/app/api/timers/keys";
import type { PomodoroSession } from "@/app/api/timers/api";
import { useTodayTodos } from "@/app/_hooks/todo";
import { useMemo, useEffect } from "react";
import { useTimer } from "@/app/_contexts/TimerContext";

type PreviewMainProps = {
  state: boolean;
};

export default function PreviewMain({ state }: PreviewMainProps) {
  const { data: profile, isLoading } = useProfile();
  const queryClient = useQueryClient();
  const { data: todayTodos = [], isFetched: isTodayTodosFetched } = useTodayTodos();
  const { setHasSelectedTodo } = useTimer();
  
  const savedTodoId = typeof window !== "undefined" 
    ? localStorage.getItem("groupMySidebar_selectedTodoId")
    : null;
  
  const validTodoId = useMemo(() => {
    if (!savedTodoId) return null;
    if (!isTodayTodosFetched) return savedTodoId;
    for (const category of todayTodos) {
      const found = category.todos.find((todo) => todo.id === savedTodoId);
      if (found) return savedTodoId;
    }
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("groupMySidebar_selectedTodoId");
    }
    return null;
  }, [savedTodoId, todayTodos, isTodayTodosFetched]);
  
  const currentSession = validTodoId 
    ? queryClient.getQueryData<PomodoroSession>(timerKeys.pomodoro(validTodoId))
    : queryClient.getQueryData<PomodoroSession>(timerKeys.current());
  
  const todoId = currentSession?.todo?.id ?? validTodoId;

  useEffect(() => {
    setHasSelectedTodo(!!todoId);
  }, [todoId, setHasSelectedTodo]);

  const isPending = isLoading || !profile;

  return (
    <div className="h-full w-[327px] min-w-[327px] flex flex-col justify-between px-6 py-6 rounded-[20px] bg-white">
      {isPending ? (
        <div className="flex flex-col gap-2 animate-pulse">
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
      ) : (
        <PreviewCharacter
          state={state}
          nickname={profile.nickname}
          character={profile.character}
        />
      )}

      {isPending ? (
        <div className="mt-4 w-full h-[60px] rounded-lg bg-gray-100 animate-pulse" />
      ) : (
        <>
          {!state && <Quotes Quotes={profile.quote} />}
          <GroupMySidebar state={state} />
        </>
      )}

      <TimerComponent todoId={todoId} />
    </div>
  );
}
