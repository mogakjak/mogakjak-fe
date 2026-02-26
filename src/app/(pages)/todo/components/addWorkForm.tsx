"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import CategorySelect, { type CategoryOption } from "./categorySelect";
import WorkTitleField from "./workTitleField";
import DateField from "./dateField";
import DurationField from "./durationField";
import clsx from "clsx";
import WorkSelectField from "./workSelectField";
import type { Todo } from "@/app/_types/todo";
import type { CategoryColorToken } from "@/app/_types/category";

export type AddWorkPayload = {
  categoryId: string;
  title: string;
  date: Date;
  targetSeconds: number;
  isOnboarding?: boolean;
};

export default function AddWorkForm({
  type,
  categories,
  defaultDate = new Date(),
  initialValues,
  onSubmit,
  onClose,
  onCategorySelect,
  todayTodos,
  className,
  isOnboarding,
}: {
  type: string;
  categories: CategoryOption[];
  defaultDate?: Date;
  initialValues?: {
    categoryId?: string;
    title?: string;
    date?: Date;
    targetSeconds?: number;
  };
  onSubmit?: (payload: AddWorkPayload) => void;
  onClose?: () => void;
  onCategorySelect?: (categoryId: string) => void;
  todayTodos?: Todo[];
  className?: string;
  isOnboarding?: boolean;
}) {
  // 1. 온보딩용 목업 데이터 정의 (TS 에러 해결을 위해 colorToken 사용)
  const mockData = useMemo(() => ({
    categoryId: categories[0]?.id ?? "mock-id",
    title: "OPIC 공부",
    date: new Date(2026, 2, 2, 0, 0),
    targetSeconds: 3600,
  }), [categories]);

  // 2. 초기값 설정
  const [categoryId, setCategoryId] = useState<string>(
    initialValues?.categoryId ?? (isOnboarding ? mockData.categoryId : ""),
  );
  const [title, setTitle] = useState(
    initialValues?.title ?? (isOnboarding ? mockData.title : ""),
  );
  const [date, setDate] = useState<Date>(
    initialValues?.date ?? (isOnboarding ? mockData.date : defaultDate),
  );
  const [target, setTarget] = useState<number>(
    initialValues?.targetSeconds ?? (isOnboarding ? mockData.targetSeconds : 0),
  );

  const prevInitialValuesRef = useRef<string>("");

  const displayCategories = useMemo((): CategoryOption[] => {
    if (isOnboarding && categories.length === 0) {
      return [
        {
          id: "mock-id",
          name: "자기계발",
          colorToken: "category-1-red" as CategoryColorToken
        }
      ];
    }
    return categories;
  }, [categories, isOnboarding]);

  const filteredTodayTodos = useMemo(() => {
    if (!categoryId || !todayTodos) return todayTodos ?? [];
    return todayTodos.filter((todo) => todo.categoryId === categoryId);
  }, [categoryId, todayTodos]);

  useEffect(() => {
    if (!initialValues) return;
    const currentKey = JSON.stringify({
      categoryId: initialValues.categoryId,
      title: initialValues.title,
      date: initialValues.date?.getTime(),
      targetSeconds: initialValues.targetSeconds,
    });

    if (prevInitialValuesRef.current !== currentKey) {
      prevInitialValuesRef.current = currentKey;
      setCategoryId(initialValues.categoryId ?? "");
      setTitle(initialValues.title ?? "");
      if (initialValues.date) {
        setDate(initialValues.date);
      }
      setTarget(initialValues.targetSeconds ?? 0);
    }
  }, [initialValues]);

  const isValid =
    categoryId && title.trim().length > 0 && target >= 60 && target <= 86400;

  const handleSubmit = () => {
    if (isValid) {
      onSubmit?.({
        categoryId,
        title: title.trim(),
        date,
        targetSeconds: target,
        isOnboarding,
      });
    }
  };

  return (
    <div
      className={clsx(
        "w-[516px] p-5 bg-neutral-50 rounded-[20px] shadow-[0_0_20px_0_rgba(0,0,0,0.15)] inline-flex flex-col items-end gap-2",
        className,
      )}
    >
      <button type="button" onClick={onClose} aria-label="닫기" className="w-6 h-6">
        <Image src="/Icons/cancel.svg" alt="닫기" width={24} height={24} className="w-6 h-6" />
      </button>

      <div className="self-stretch p-5 flex flex-col items-center gap-7">
        <div className="self-stretch text-center text-neutral-900 text-xl font-semibold leading-7">
          {
            type === "select" ? "몰입할 일을 선택해 보세요!" :
              type === "edit" ? "일을 수정해 보세요!" : "일을 등록해 보세요!"
          }
          <p className="text-body2-14SB text-gray-400 mt-2">
            {isOnboarding
              ? "원하는 목표를 입력하고 시작 버튼을 눌러보세요."
              : "과거 작업을 선택하고 버튼을 누르면, 오늘 할 일로 설정됩니다."}
          </p>
        </div>

        <div className="self-stretch flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="text-neutral-900 text-base font-semibold leading-snug">몰입할 날짜</div>
            <DateField value={date} onChange={setDate} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-neutral-900 text-base font-semibold leading-snug">카테고리</div>
            <CategorySelect
              value={categoryId || null}
              options={displayCategories}
              onChange={(id) => {
                setCategoryId(id);
                onCategorySelect?.(id);
              }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-neutral-900 text-base font-semibold leading-snug">작업</div>
            {type === "select" ? (
              <WorkSelectField
                value={title}
                onChange={(selectedTask) => {
                  setTitle(selectedTask);
                  if (filteredTodayTodos && selectedTask) {
                    const selectedTodo = filteredTodayTodos.find((todo) => todo.task === selectedTask);
                    if (selectedTodo) {
                      setCategoryId(selectedTodo.categoryId);
                      onCategorySelect?.(selectedTodo.categoryId);
                      const [year, month, day] = selectedTodo.date.split("-").map(Number);
                      setDate(new Date(year, month - 1, day));
                      setTarget(selectedTodo.targetTimeInSeconds);
                    }
                  }
                }}
                todayTodos={filteredTodayTodos}
              />
            ) : (
              <WorkTitleField value={title} onChange={setTitle} />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-neutral-900 text-base font-semibold leading-snug">목표 달성 시간</div>
            <div className="text-zinc-600 text-sm leading-tight mb-[12px]">
              언제든 수정 가능하니 부담없이 설정해 보세요
            </div>
            <DurationField seconds={target} onChange={setTarget} />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className={clsx(
            "w-40 h-12 px-6 py-3 rounded-2xl inline-flex justify-center items-center font-bold",
            isValid ? "bg-red-500 text-neutral-50" : "bg-gray-200 text-gray-400",
          )}
        >
          {isOnboarding ? "시작하기" : (
            type === "select" ? "할 일 선택" : type === "edit" ? "작업 수정" : "작업 추가"
          )}
        </button>
      </div>
    </div>
  );
}