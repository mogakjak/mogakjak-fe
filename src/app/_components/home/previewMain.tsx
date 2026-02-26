"use client";

import { useProfile } from "@/app/_hooks/mypage/useProfile";
import { useQueryClient } from "@tanstack/react-query";
import TimerComponent from "../common/timer/timerComponent";
import GroupMySidebar from "../../(pages)/group/_components/sidebar/groupMySidebar";
import PreviewCharacter from "./preview/previewCharacter";
import Quotes from "./preview/quotes";
import { timerKeys } from "@/app/api/timers/keys";
import type { PomodoroSession } from "@/app/api/timers/api";
import { useTodayTodos } from "@/app/_hooks/todo/useTodayTodos";
import { useMemo, useEffect, useState } from "react";
import { useTimer } from "@/app/_contexts/TimerContext";
import { useGroupDetail } from "@/app/_hooks/groups/useGroupDetail";
import { useGroupMemberStatus } from "@/app/_hooks/_websocket/status/useGroupMemberStatus";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
import { getUserIdFromToken } from "@/app/_lib/getJwtExp";

type PreviewMainProps = {
  state: boolean;
  groupId?: string;
  isOnboarding?: boolean;
  currentStep?: number;
};

export default function PreviewMain({ state, groupId, isOnboarding = false, currentStep }: PreviewMainProps) {
  const { data: profile, isLoading } = useProfile();
  const queryClient = useQueryClient();
  const { data: todayTodos = [], isFetched: isTodayTodosFetched } =
    useTodayTodos();
  const { setHasSelectedTodo } = useTimer();
  const [isTaskPublic, setIsTaskPublic] = useState(true);
  const [isTimerPublic, setIsTimerPublic] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const validGroupId = groupId && groupId !== "undefined" ? groupId : "";
  const { data: groupData } = useGroupDetail(validGroupId, {
    enabled: !!validGroupId,
  });

  const { memberStatuses } = useGroupMemberStatus({
    groupId: validGroupId,
    groupData: groupData!,
    enabled: !!validGroupId && !!groupData,
  });

  const { token } = useAuthState();

  const currentUserId = useMemo(() => {
    return getUserIdFromToken(token);
  }, [token]);

  const myCheerCount = useMemo(() => {
    if (!currentUserId || !memberStatuses) return 0;
    const myStatus = memberStatuses.get(currentUserId);
    return myStatus?.cheerCount || 0;
  }, [currentUserId, memberStatuses]);

  const isHost = useMemo(() => {
    if (!currentUserId || !memberStatuses) return false;
    const myStatus = memberStatuses.get(currentUserId);
    return myStatus?.role === "HOST";
  }, [currentUserId, memberStatuses]);

  const [savedTodoId, setSavedTodoId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedTodoId");
    }
    return null;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleTodoIdChange = () => {
      const newTodoId = localStorage.getItem("selectedTodoId");
      setSavedTodoId(newTodoId);
    };

    window.addEventListener("todoIdChanged", handleTodoIdChange);
    window.addEventListener("storage", handleTodoIdChange);

    return () => {
      window.removeEventListener("todoIdChanged", handleTodoIdChange);
      window.removeEventListener("storage", handleTodoIdChange);
    };
  }, []);

  const validTodoId = useMemo(() => {
    if (!savedTodoId) return null;
    if (!isTodayTodosFetched) return savedTodoId;
    for (const category of todayTodos) {
      const found = category.todos.find((todo) => todo.id === savedTodoId);
      if (found) return savedTodoId;
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("selectedTodoId");
      setSavedTodoId(null);
    }
    return null;
  }, [savedTodoId, todayTodos, isTodayTodosFetched]);

  const currentSession = useMemo(() => {
    if (validTodoId) {
      return queryClient.getQueryData<PomodoroSession>(timerKeys.pomodoro(validTodoId));
    }
    return queryClient.getQueryData<PomodoroSession>(timerKeys.current());
  }, [validTodoId, queryClient]);

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === "updated") {
        const queryKey = event.query.queryKey;
        if (queryKey[0] === "timers") {
          if (validTodoId && queryKey[1] === "pomodoro" && queryKey[2] === validTodoId) {
            setSavedTodoId((prev) => prev);
          } else if (!validTodoId && queryKey[1] === "current") {
            setSavedTodoId((prev) => prev);
          }
        }
      }
    });

    return unsubscribe;
  }, [validTodoId, queryClient]);

  const todoId = validTodoId ?? currentSession?.todo?.id ?? null;

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
          cheerCount={myCheerCount}
          isHost={isHost}
        />
      )}

      {isPending ? (
        <div className="mt-4 w-full h-[60px] rounded-lg bg-gray-100 animate-pulse" />
      ) : (
        <>
          {!state && <Quotes Quotes={profile.quote} />}
          <GroupMySidebar
            state={state}
            isTaskPublic={isTaskPublic}
            isTimerPublic={isTimerPublic}
            setIsTaskPublic={setIsTaskPublic}
            setIsTimerPublic={setIsTimerPublic}
            currentSessionId={currentSessionId}
            isOnboarding={isOnboarding}
            isStepFive={currentStep === 5}
          />
        </>
      )}

      <TimerComponent
        todoId={todoId}
        groupId={groupId}
        isTaskPublic={isTaskPublic}
        isTimerPublic={isTimerPublic}
        onSessionIdChange={setCurrentSessionId}
      />
    </div>
  );
}
