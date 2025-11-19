"use client";

import { useCallback, useMemo, useState } from "react";

import Icon from "../../../../_components/common/Icons";
import Edit from "/Icons/edit.svg";
import Book from "/Icons/book.svg";
import Clock from "/Icons/stopwatch.svg";
import AddWorkForm, {
  AddWorkPayload,
} from "@/app/(pages)/todo/components/addWorkForm";
import { CategoryOption } from "@/app/(pages)/todo/components/categorySelect";
import VisibilityToggle from "./visibilityButton";
import {
  CATEGORY_COLOR_TOKEN_BY_NAME,
  useTodoCategoryController,
} from "@/app/_hooks/todoCategory";
import { useTodoController, useTodayTodos } from "@/app/_hooks/todo";
import { useQueryClient } from "@tanstack/react-query";
import { todoKeys } from "@/app/api/todos/keys";
import { timerKeys } from "@/app/api/timers/keys";
import type { Todo } from "@/app/_types/todo";
import { useTodayTodoSync } from "./useTodayTodoSync";

export default function GroupMySidebar({ state }: { state: boolean }) {
  const [isTaskOpen, setIsTaskOpen] = useState(true);
  const [isTimeOpen, setIsTimeOpen] = useState(true);
  const [selectedWork, setSelectedWork] = useState<AddWorkPayload | null>(null);
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(() => {
    // localStorage에서 저장된 selectedTodoId 불러오기
    if (typeof window !== "undefined") {
      return localStorage.getItem("groupMySidebar_selectedTodoId");
    }
    return null;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { categories } = useTodoCategoryController();
  const { createTodo, updateTodo } = useTodoController();
  const { data: todayTodos = [], refetch: refetchTodayTodos } = useTodayTodos();
  const queryClient = useQueryClient();

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
  const formatSeconds = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const secs = String(safeSeconds % 60).padStart(2, "0");
    return `${hours} : ${minutes} : ${secs}`;
  };

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

  const handleWorkSubmit = useCallback(
    async (payload: AddWorkPayload) => {
      const yyyy = payload.date.getFullYear();
      const mm = String(payload.date.getMonth() + 1).padStart(2, "0");
      const dd = String(payload.date.getDate()).padStart(2, "0");
      const formatted = `${yyyy}-${mm}-${dd}`;
    
      const existingTodo = todayTodosList.find(
        (todo) => todo.task === payload.title
      );

      let resultTodo: Todo | null = null;

      if (existingTodo) {
        resultTodo = await updateTodo({
          todoId: existingTodo.id,
          payload: {
            categoryId: payload.categoryId,
            task: payload.title,
            date: formatted,
            targetTimeInSeconds: payload.targetSeconds,
          },
        });
      } else {
        resultTodo = await createTodo({
          categoryId: payload.categoryId,
          task: payload.title,
          date: formatted,
          targetTimeInSeconds: payload.targetSeconds,
        });
      }
    
      if (resultTodo) {
        if (typeof window !== "undefined") {
          localStorage.setItem("groupMySidebar_selectedTodoId", resultTodo.id);
        }
        setSelectedTodoId(resultTodo.id); 
        setCurrentTodo(resultTodo);
        const [year, month, day] = resultTodo.date.split("-").map(Number);
        setSelectedWork({
          categoryId: resultTodo.categoryId,
          title: resultTodo.task,
          date: new Date(year, month - 1, day),
          targetSeconds: resultTodo.targetTimeInSeconds,
        });
        
        queryClient.setQueryData(timerKeys.pomodoro(resultTodo.id), {
          todo: {
            id: resultTodo.id,
            task: resultTodo.task,
            targetTimeInSeconds: resultTodo.targetTimeInSeconds,
          },
        });
      }
      
      // 캐시 무효화 및 강제 refetch
      await queryClient.invalidateQueries({ queryKey: todoKeys.today() });
      await queryClient.invalidateQueries({ queryKey: todoKeys.my() });
      await refetchTodayTodos();
      
      setModalOpen(false);
      setSelectedCategoryId(null);
    },
    [createTodo, updateTodo, todayTodosList, queryClient, refetchTodayTodos]
  );

  const hasTodo = todayTodo || currentTodo || selectedWork;
  return (
    <div className=" bg-white rounded-2xl">
      <div className="border rounded-lg border-gray-200 p-3">
        {hasTodo ? (
          <>
            <div className="flex items-center">
              <Icon Svg={Book} size={24} className={"text-gray-400"} />
              <p className="text-body2-14SB ml-1">
                {todayTodo?.task ?? currentTodo?.task ?? selectedWork?.title}
              </p>

              <button className="ml-auto" onClick={() => setModalOpen(true)}>
                <Icon Svg={Edit} size={24} className="text-gray-600" />
              </button>
            </div>
            {state && (
              <VisibilityToggle
                isTaskOpen={isTaskOpen}
                setIsTaskOpen={setIsTaskOpen}
              />
            )}
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center">
                <Icon Svg={Clock} size={24} className={"text-gray-400"} />
                <h3 className="text-body2-14SB ml-1">
                  {formatSeconds(todayTodo?.actualTimeInSeconds ?? currentTodo?.actualTimeInSeconds ?? 0)}
                </h3>
              </div>
              {state && (
                <VisibilityToggle
                  isTaskOpen={isTimeOpen}
                  setIsTaskOpen={setIsTimeOpen}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Icon Svg={Book} size={24} className="text-gray-400" />
                  <p className="text-body2-14SB ml-1 text-gray-400">
                    할 일을 설정해 주세요!
                  </p>
                </div>
                <button onClick={() => setModalOpen(true)}>
                  <Icon Svg={Edit} size={24} className="text-gray-600" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center">
                <Icon Svg={Clock} size={24} className="text-gray-400" />
                <h3 className="text-body2-14SB ml-1 text-gray-400">
                  00 : 00 : 00
                </h3>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 mt-2 bg-gray-100 rounded-lg px-4 py-3">
        <p className="text-caption-12SB text-gray-600">
          <b className="text-black mr-2">목표시간</b>{" "}
          {formatSeconds(
            todayTodo?.targetTimeInSeconds ??
            currentTodo?.targetTimeInSeconds ??
            selectedWork?.targetSeconds ??
            0
          )}
        </p>
        <p className="text-caption-12SB text-gray-600">
          <b className="text-black mr-2">현재 달성률</b>{" "}
          {(() => {
            const todo = todayTodo ?? currentTodo;
            if (todo && todo.targetTimeInSeconds > 0) {
              return Math.round(
                (todo.actualTimeInSeconds / todo.targetTimeInSeconds) * 100
              );
            }
            return 0;
          })()}
          %
        </p>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-999">
          <AddWorkForm
            type="select"
            categories={categoryOptions}
            todayTodos={todayTodosList}
            initialValues={
              todayTodo ?? currentTodo
                ? (() => {
                    const todo = todayTodo ?? currentTodo;
                    if (!todo) return undefined;
                    const [year, month, day] = todo.date.split("-").map(Number);
                    return {
                      categoryId: todo.categoryId,
                      title: todo.task,
                      date: new Date(year, month - 1, day),
                      targetSeconds: todo.targetTimeInSeconds,
                    };
                  })()
                : selectedCategoryId
                ? {
                    categoryId: selectedCategoryId,
                  }
                : undefined
            }
            onSubmit={handleWorkSubmit}
            onCategorySelect={setSelectedCategoryId}
            onClose={() => {
              setModalOpen(false);
              setSelectedCategoryId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
