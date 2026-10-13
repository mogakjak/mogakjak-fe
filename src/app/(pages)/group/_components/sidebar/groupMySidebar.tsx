"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import clsx from "clsx";

import Icon from "../../../../_components/common/Icons";
import Edit from "/Icons/edit.svg";
import Book from "/Icons/book.svg";
import Clock from "/Icons/stopwatch.svg";
import type { AddWorkPayload } from "@/app/(pages)/todo/components/addWorkForm";
import CategorySelect, {
  type CategoryOption,
} from "@/app/(pages)/todo/components/categorySelect";
import VisibilityToggle from "./visibilityButton";
import WorkCombobox from "./todoSetting/workCombobox";
import TargetTimeBox, { formatHms } from "./todoSetting/targetTimeBox";
import { CATEGORY_COLOR_TOKEN_BY_NAME } from "@/app/_constants/categoryColor";
import {
  DEFAULT_CATEGORY_NAME,
  useTodoCategoryController,
} from "@/app/_hooks/todoCategory/useTodoCategoryController";
import { useTodoController } from "@/app/_hooks/todo/useTodoController";
import { useTodayTodos } from "@/app/_hooks/todo/useTodayTodos";
import { useMyTodos } from "@/app/_hooks/todo/useMyTodos";
import { useQueryClient } from "@tanstack/react-query";
import { todoKeys } from "@/app/api/todos/keys";
import { timerKeys } from "@/app/api/timers/keys";
import type { Todo, TodoCategoryWithTodos } from "@/app/_types/todo";
import type { TodoCategoryColor } from "@/app/_types/todoCategory";
import { useTodayTodoSync } from "./useTodayTodoSync";
import { updatePersonalTimerVisibility } from "@/app/api/timers/api";
import { useTimer } from "@/app/_contexts/TimerContext";
import { useLiveTimer } from "@/app/_hooks/timers/useLiveTimer";
import TimerEndModal from "@/app/_components/common/timerEndModal";
import { sendGAEvent } from "@next/third-parties/google";
import {
  isTodayDateString,
  parseLocalDateString,
  toLocalDateString,
} from "@/app/_utils/date";

const CATEGORY_COLORS = Object.keys(
  CATEGORY_COLOR_TOKEN_BY_NAME,
) as TodoCategoryColor[];

type GroupMySidebarProps = {
  state: boolean;
  isTaskPublic?: boolean;
  isTimerPublic?: boolean;
  setIsTaskPublic?: (v: boolean) => void;
  setIsTimerPublic?: (v: boolean) => void;
  currentSessionId?: string | null;
  isOnboarding?: boolean;
  isStepFive?: boolean;
};

function getProgressRate(todo: Todo | null) {
  if (!todo) return 0;
  if (todo.progressRate !== undefined && todo.progressRate !== null) {
    return Math.round(todo.progressRate);
  }
  const target = todo.targetTimeInSeconds ?? 0;
  if (target > 0) {
    return Math.round((todo.actualTimeInSeconds / target) * 100);
  }
  return 0;
}

export default function GroupMySidebar({
  state,
  isTaskPublic: externalIsTaskPublic,
  isTimerPublic: externalIsTimerPublic,
  setIsTaskPublic: externalSetIsTaskPublic,
  setIsTimerPublic: externalSetIsTimerPublic,
  currentSessionId,
  isOnboarding = false,
  isStepFive = false,
}: GroupMySidebarProps) {


  const mockOnboardingTodo = {
    task: "OPIC 공부",
    actualTimeInSeconds: 2700,
    targetTimeInSeconds: 3600,
    progressRate: 75,
  };

  const [internalIsTaskOpen, setInternalIsTaskOpen] = useState(true);
  const [internalIsTimeOpen, setInternalIsTimeOpen] = useState(true);

  // 외부에서 전달된 값이 있으면 사용, 없으면 내부 상태 사용
  const isTaskOpen = externalIsTaskPublic ?? internalIsTaskOpen;
  const isTimeOpen = externalIsTimerPublic ?? internalIsTimeOpen;

  const setIsTaskOpen = externalSetIsTaskPublic ?? setInternalIsTaskOpen;
  const setIsTimeOpen = externalSetIsTimerPublic ?? setInternalIsTimeOpen;
  const [selectedWork, setSelectedWork] = useState<AddWorkPayload | null>(null);
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(() => {
    // localStorage에서 저장된 selectedTodoId 불러오기
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedTodoId");
    }
    return null;
  });
  const [pickedCategoryId, setPickedCategoryId] = useState<string | null>(null);
  const [isWorkOpen, setIsWorkOpen] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [timerEndModalOpen, setTimerEndModalOpen] = useState(false);

  const { isRunning, forceStopTimer } = useTimer();

  const { categories, createCategory } = useTodoCategoryController();
  const { createTodo, updateTodo } = useTodoController();
  const { data: todayTodos = [], refetch: refetchTodayTodos } = useTodayTodos();
  const { data: myTodos = [] } = useMyTodos();
  const queryClient = useQueryClient();
  const prevSessionIdRef = useRef<string | null | undefined>(currentSessionId);


  useEffect(() => {
    if (prevSessionIdRef.current && !currentSessionId) {
      queryClient.invalidateQueries({ queryKey: todoKeys.today() });
      queryClient.invalidateQueries({ queryKey: todoKeys.my() });
      refetchTodayTodos();
    }
    prevSessionIdRef.current = currentSessionId;
  }, [currentSessionId, queryClient, refetchTodayTodos]);

  const todayTodo = useMemo<Todo | null>(() => {
    if (selectedTodoId) {
      for (const category of todayTodos) {
        const found = category.todos.find((todo) => todo.id === selectedTodoId);
        if (found) return found;
      }
    }
    return null;
  }, [todayTodos, selectedTodoId]);

  const todayTodosList = useMemo<Todo[]>(() => {
    const todos: Todo[] = [];
    for (const category of todayTodos) {
      todos.push(...category.todos);
    }
    return todos;
  }, [todayTodos]);
  useTodayTodoSync({
    todayTodo,
    selectedTodoId,
    setCurrentTodo,
    setSelectedWork,
    setSelectedTodoId,
  });

  const activeTodo = todayTodo ?? currentTodo;
  const isSessionActive = isRunning || !!currentSessionId;

  const serverActualSeconds = useMemo(() => {
    return todayTodo?.actualTimeInSeconds ?? currentTodo?.actualTimeInSeconds ?? 0;
  }, [todayTodo, currentTodo]);

  const liveActualSeconds = useLiveTimer({
    serverSeconds: serverActualSeconds,
    isRunning: isRunning && !!currentSessionId,
  });

  const categoryOptions = useMemo<CategoryOption[]>(
    () =>
      categories.map((c) => {
        const baseToken =
          CATEGORY_COLOR_TOKEN_BY_NAME[
          c.color as keyof typeof CATEGORY_COLOR_TOKEN_BY_NAME
          ] ?? "category-1-red";
        return {
          id: c.id,
          name: c.name,
          colorToken: baseToken,
        };
      }),
    [categories]
  );

  const defaultCategoryId = useMemo(
    () =>
      categories.find((c) => c.name === DEFAULT_CATEGORY_NAME)?.id ??
      categories[0]?.id ??
      null,
    [categories],
  );

  const categoryId =
    pickedCategoryId ??
    activeTodo?.categoryId ??
    selectedWork?.categoryId ??
    defaultCategoryId;

  const categoryName = useMemo(
    () => categories.find((c) => c.id === categoryId)?.name ?? "",
    [categories, categoryId],
  );

  const categoryTodos = useMemo(
    () => myTodos.filter((todo) => todo.categoryId === categoryId),
    [myTodos, categoryId],
  );

  const applyTodo = useCallback(
    async (resultTodo: Todo) => {
      queryClient.setQueryData<TodoCategoryWithTodos[]>(
        todoKeys.today(),
        (prev = []) => {
          const next = prev.map((cat) => {
            if (cat.id !== resultTodo.categoryId) return cat;
            const idx = cat.todos.findIndex((t) => t.id === resultTodo.id);
            const todos =
              idx >= 0
                ? cat.todos.map((t) => (t.id === resultTodo.id ? resultTodo : t))
                : [...cat.todos, resultTodo];
            return { ...cat, todos };
          });
          const hasCategory = next.some((c) => c.id === resultTodo.categoryId);
          if (!hasCategory) {
            const cat = categories.find((c) => c.id === resultTodo.categoryId);
            if (cat) {
              next.push({
                ...cat,
                todos: [resultTodo],
              });
            }
          }
          return next;
        }
      );

      setSelectedTodoId(resultTodo.id);
      setCurrentTodo(resultTodo);
      setPickedCategoryId(null);
      setSelectedWork({
        categoryId: resultTodo.categoryId,
        title: resultTodo.task,
        date: parseLocalDateString(resultTodo.date),
        targetSeconds: resultTodo.targetTimeInSeconds ?? 0,
      });
      queryClient.setQueryData(timerKeys.pomodoro(resultTodo.id), {
        todo: {
          id: resultTodo.id,
          task: resultTodo.task,
          targetTimeInSeconds: resultTodo.targetTimeInSeconds,
        },
      });

      await refetchTodayTodos();

      if (typeof window !== "undefined") {
        localStorage.setItem("selectedTodoId", resultTodo.id);
        window.dispatchEvent(new Event("todoIdChanged"));
      }
    },
    [queryClient, categories, refetchTodayTodos]
  );

  const handleSelectTodo = useCallback(
    async (todo: Todo) => {
      setIsWorkOpen(false);
      try {
        if (isTodayDateString(todo.date)) {
          await applyTodo(todo);
          return;
        }
        // 과거 작업을 선택하면 오늘 할 일로 옮겨서 실행
        sendGAEvent("event", "past_todo_select_to_today");
        const updated = await updateTodo({
          todoId: todo.id,
          payload: {
            categoryId: todo.categoryId,
            task: todo.task,
            date: toLocalDateString(new Date()),
            targetTimeInSeconds: todo.targetTimeInSeconds,
          },
        });
        if (updated) await applyTodo(updated);
      } catch (error) {
        console.error("할 일 선택 실패:", error);
      }
    },
    [applyTodo, updateTodo]
  );

  const handleCreateTodo = useCallback(
    async (title: string) => {
      if (!categoryId) return;
      setIsWorkOpen(false);
      try {
        const existingTodo = todayTodosList.find(
          (todo) => todo.task === title && todo.categoryId === categoryId,
        );
        if (existingTodo) {
          await applyTodo(existingTodo);
          return;
        }
        const created = await createTodo({
          categoryId,
          task: title,
          date: toLocalDateString(new Date()),
          targetTimeInSeconds: null,
        });
        if (created) await applyTodo(created);
      } catch (error) {
        console.error("할 일 생성 실패:", error);
      }
    },
    [categoryId, todayTodosList, applyTodo, createTodo]
  );

  const handleCreateCategory = useCallback(
    async (name: string) => {
      try {
        const created = await createCategory({
          name,
          color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
        });
        setPickedCategoryId(created.id);
        setIsWorkOpen(true);
      } catch (error) {
        console.error("카테고리 생성 실패:", error);
      }
    },
    [createCategory, categories.length]
  );

  const handleCategoryChange = useCallback((id: string) => {
    setPickedCategoryId(id);
    setIsWorkOpen(true);
  }, []);

  const handleWorkOpenChange = useCallback(
    (open: boolean) => {
      setIsWorkOpen(open);
      // 작업을 고르지 않고 닫으면 현재 할 일의 카테고리로 되돌림
      if (!open && activeTodo) setPickedCategoryId(null);
    },
    [activeTodo]
  );

  const handleTargetSubmit = useCallback(
    async (seconds: number | null) => {
      if (!activeTodo) return;
      try {
        const updated = await updateTodo({
          todoId: activeTodo.id,
          payload: {
            categoryId: activeTodo.categoryId,
            task: activeTodo.task,
            date: activeTodo.date,
            targetTimeInSeconds: seconds,
          },
        });
        if (updated) await applyTodo(updated);
      } catch (error) {
        console.error("목표 시간 수정 실패:", error);
      }
    },
    [activeTodo, updateTodo, applyTodo]
  );

  const showTodoCard = isOnboarding || isSessionActive;
  const cardTitle = isOnboarding
    ? mockOnboardingTodo.task
    : (activeTodo?.task ?? selectedWork?.title ?? "");
  const cardTargetSeconds = isOnboarding
    ? mockOnboardingTodo.targetTimeInSeconds
    : (activeTodo?.targetTimeInSeconds ?? selectedWork?.targetSeconds ?? 0);
  const cardProgressRate = isOnboarding
    ? mockOnboardingTodo.progressRate
    : getProgressRate(activeTodo);

  return (
    <div className=" bg-white rounded-2xl">
      {showTodoCard ? (
        <div
          className={clsx(
            "border rounded-lg overflow-hidden",
            isStepFive ? "border-red-200 border-4" : "border-gray-200",
          )}
        >
          <div className="flex flex-col gap-2 p-3">
            <div className="flex items-center gap-1">
              <Icon Svg={Book} size={24} className="text-gray-400" />
              <p className="text-body2-14SB truncate" title={cardTitle}>
                “{cardTitle}”
              </p>

              <button
                className="ml-auto"
                onClick={() => {
                  if (isSessionActive) setTimerEndModalOpen(true);
                }}
                aria-label="할 일 편집"
              >
                <Icon Svg={Edit} size={24} className="text-gray-600" />
              </button>
            </div>
            {state && (
              <VisibilityToggle
                isTaskOpen={isTaskOpen}
                setIsTaskOpen={async (v: boolean) => {
                  sendGAEvent("event", "visibility_toggle", {
                    public_type: "task",
                    is_public: v ? "public" : "private",
                  });
                  setIsTaskOpen(v);
                  if (currentSessionId) {
                    try {
                      await updatePersonalTimerVisibility(currentSessionId, {
                        isTaskPublic: v,
                      });
                    } catch (error) {
                      console.error("할일 공개/비공개 설정 실패:", error);
                      setIsTaskOpen(!v);
                    }
                  }
                }}
              />
            )}
            <div className="flex items-center mt-1">
              <Icon Svg={Clock} size={24} className={"text-gray-400"} />
              <h3 className="text-body2-14SB ml-1">
                {isOnboarding
                  ? formatHms(mockOnboardingTodo.actualTimeInSeconds)
                  : formatHms(
                    liveActualSeconds > 0 ? liveActualSeconds : serverActualSeconds
                  )}
              </h3>
            </div>
            {state && (
              <VisibilityToggle
                isTaskOpen={isTimeOpen}
                setIsTaskOpen={async (v: boolean) => {
                  sendGAEvent("event", "visibility_toggle", {
                    public_type: "timer",
                    is_public: v ? "public" : "private",
                  });
                  setIsTimeOpen(v);
                  if (currentSessionId) {
                    try {
                      await updatePersonalTimerVisibility(currentSessionId, {
                        isTimerPublic: v,
                      });
                    } catch (error) {
                      console.error(
                        "타이머 누적 시간 공개/비공개 설정 실패:",
                        error
                      );
                      setIsTimeOpen(!v);
                    }
                  }
                }}
              />
            )}
          </div>

          <div className="flex flex-col gap-1 bg-gray-100 px-4 py-3">
            <p className="text-body2-14R text-gray-600">
              <b className="text-gray-800 mr-3 text-body2-14SB">목표 시간</b>
              {cardTargetSeconds > 0 ? formatHms(cardTargetSeconds) : "미설정"}
            </p>
            <p className="text-body2-14R text-gray-600">
              <b className="text-gray-800 mr-3 text-body2-14SB">현재 달성률</b>
              {cardProgressRate}%
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-body2-14SB text-gray-800">카테고리</p>
            <CategorySelect
              value={categoryId}
              options={categoryOptions}
              onChange={handleCategoryChange}
              onCreate={handleCreateCategory}
              disabled={isEditingTarget}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-body2-14SB text-gray-800">작업</p>
            <WorkCombobox
              categoryName={categoryName}
              todos={categoryTodos}
              selectedTitle={
                activeTodo && activeTodo.categoryId === categoryId
                  ? activeTodo.task
                  : undefined
              }
              open={isWorkOpen}
              onOpenChange={handleWorkOpenChange}
              onSelect={handleSelectTodo}
              onCreate={handleCreateTodo}
              disabled={isEditingTarget}
            />
          </div>

          {activeTodo && (
            <div className={clsx(isEditingTarget && "relative z-50")}>
              <TargetTimeBox
                targetSeconds={activeTodo.targetTimeInSeconds ?? 0}
                progressRate={getProgressRate(activeTodo)}
                editing={isEditingTarget}
                onEditingChange={setIsEditingTarget}
                onSubmit={handleTargetSubmit}
              />
            </div>
          )}
        </div>
      )}

      {isEditingTarget && (
        <div className="fixed inset-0 z-40" aria-hidden />
      )}

      {timerEndModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <TimerEndModal
            onClose={() => setTimerEndModalOpen(false)}
            onConfirm={async () => {
              await forceStopTimer();
              setTimerEndModalOpen(false);
              setIsWorkOpen(true);
            }}
          />
        </div>
      )}
    </div>
  );
}
