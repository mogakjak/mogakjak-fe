"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
import type { Todo } from "@/app/_types/todo";

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
  const [isCreating, setIsCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { categories } = useTodoCategoryController();
  const { createTodo, updateTodo } = useTodoController();
  const { data: todayTodos = [], refetch: refetchTodayTodos } = useTodayTodos();
  const queryClient = useQueryClient();

  // 오늘의 할일 찾기 (todayTodos는 이미 오늘 날짜의 할일만 반환)
  // selectedTodoId가 있으면 해당 할일을, 없으면 첫 번째 할일을 사용
  const todayTodo = useMemo<Todo | null>(() => {
    if (selectedTodoId) {
      for (const category of todayTodos) {
        const found = category.todos.find((todo) => todo.id === selectedTodoId);
        if (found) return found;
      }
    }
    // selectedTodoId가 없으면 첫 번째 할일 사용
    for (const category of todayTodos) {
      if (category.todos.length > 0) {
        return category.todos[0];
      }
    }
    return null;
  }, [todayTodos, selectedTodoId]);

  // 오늘의 모든 할일 목록 (모달에서 사용)
  const todayTodosList = useMemo<Todo[]>(() => {
    const todos: Todo[] = [];
    for (const category of todayTodos) {
      todos.push(...category.todos);
    }
    return todos;
  }, [todayTodos]);

  // 오늘의 할일이 있으면 표시, 없으면 생성
  useEffect(() => {
    if (todayTodo) {
      // selectedTodoId가 없거나 todayTodo의 ID가 selectedTodoId와 다를 때만 업데이트
      // (사용자가 직접 선택한 할일이 아닐 때만 자동 업데이트)
      if (!selectedTodoId || todayTodo.id === selectedTodoId) {
        setCurrentTodo(todayTodo);
        const [year, month, day] = todayTodo.date.split("-").map(Number);
        setSelectedWork({
          categoryId: todayTodo.categoryId,
          title: todayTodo.task,
          date: new Date(year, month - 1, day),
          targetSeconds: todayTodo.targetTimeInSeconds,
        });
        if (!selectedTodoId) {
          // localStorage에 저장
          if (typeof window !== "undefined") {
            localStorage.setItem("groupMySidebar_selectedTodoId", todayTodo.id);
          }
          setSelectedTodoId(todayTodo.id); // 첫 로드 시 selectedTodoId 설정
        }
      }
      setIsCreating(false);
    } else if (!todayTodo && categories.length > 0 && !isCreating) {
      // 오늘의 할일이 없고, 카테고리가 있고, 아직 생성하지 않은 경우에만 생성
      setIsCreating(true);
      const ensureTodayTodo = async () => {
        const defaultCategory = categories[0];
        // 오늘 날짜 문자열 생성
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const formatted = `${yyyy}-${mm}-${dd}`;
        
        const createdTodo = await createTodo({
          categoryId: defaultCategory.id,
          task: "와이어프레임 완료",
          date: formatted,
          targetTimeInSeconds: 3600, // 기본 1시간
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
        setIsCreating(false);
      };
      ensureTodayTodo();
    }
  }, [todayTodo, categories, createTodo, isCreating, selectedTodoId]);

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
      
      // 선택된 할일이 이미 todayTodos에 있는지 확인
      const existingTodo = todayTodosList.find(
        (todo) => todo.task === payload.title
      );

      let resultTodo: Todo | null = null;

      if (existingTodo) {
        // 기존 할일이 있으면 업데이트
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
        // 새 할일 생성
        resultTodo = await createTodo({
          categoryId: payload.categoryId,
          task: payload.title,
          date: formatted,
          targetTimeInSeconds: payload.targetSeconds,
        });
      }
      
      // 결과 할일 데이터를 selectedWork와 currentTodo에 설정
      if (resultTodo) {
        // localStorage에 선택된 할일 ID 저장
        if (typeof window !== "undefined") {
          localStorage.setItem("groupMySidebar_selectedTodoId", resultTodo.id);
        }
        setSelectedTodoId(resultTodo.id); // 선택된 할일 ID 저장
        setCurrentTodo(resultTodo);
        const [year, month, day] = resultTodo.date.split("-").map(Number);
        setSelectedWork({
          categoryId: resultTodo.categoryId,
          title: resultTodo.task,
          date: new Date(year, month - 1, day),
          targetSeconds: resultTodo.targetTimeInSeconds,
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

  return (
    <div className=" bg-white rounded-2xl">
      <div className="border rounded-lg border-gray-200 p-3">
        <div className="flex items-center">
          <Icon Svg={Book} size={24} className={"text-gray-400"} />
          <p className="text-body2-14SB ml-1">
            {todayTodo?.task ?? currentTodo?.task ?? selectedWork?.title ?? "와이어프레임 완료"}
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
