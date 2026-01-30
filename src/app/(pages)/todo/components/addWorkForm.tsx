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

export type AddWorkPayload = {
  categoryId: string;
  title: string;
  date: Date;
  targetSeconds: number;
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
}) {
  const [categoryId, setCategoryId] = useState<string>(
    initialValues?.categoryId ?? "",
  );
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [date, setDate] = useState<Date>(initialValues?.date ?? defaultDate);
  const [target, setTarget] = useState<number>(
    initialValues?.targetSeconds ?? 0,
  );
  const prevInitialValuesRef = useRef<string>("");

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

  return (
    <div
      className={clsx(
        "w-[516px] p-5 bg-neutral-50 rounded-[20px] shadow-[0_0_20px_0_rgba(0,0,0,0.15)] inline-flex flex-col items-end gap-2",
        className,
      )}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="w-6 h-6"
      >
        <Image
          src="/Icons/cancel.svg"
          alt="닫기"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      </button>

      <div className="self-stretch p-5 flex flex-col items-center gap-7">
        <div className="self-stretch text-center text-neutral-900 text-xl font-semibold leading-7">
          {type == "select"
            ? "몰입할 작업을 선택해 보세요!"
            : type == "edit"
              ? "작업을 수정해 보세요!"
              : "작업을 등록해 보세요!"}
        </div>

        <div className="self-stretch flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="text-neutral-900 text-base font-semibold leading-snug">
              카테고리
            </div>
            <CategorySelect
              value={categoryId || null}
              options={categories}
              onChange={(id) => {
                setCategoryId(id);
                onCategorySelect?.(id);
              }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-neutral-900 text-base font-semibold leading-snug">
              작업
            </div>
            {type == "select" ? (
              <WorkSelectField
                value={title}
                onChange={(selectedTask) => {
                  setTitle(selectedTask);
                  // 선택된 할일이 filteredTodayTodos에 있으면 해당 정보로 폼 채우기
                  if (filteredTodayTodos && selectedTask) {
                    const selectedTodo = filteredTodayTodos.find(
                      (todo) => todo.task === selectedTask,
                    );
                    if (selectedTodo) {
                      setCategoryId(selectedTodo.categoryId);
                      onCategorySelect?.(selectedTodo.categoryId);
                      const [year, month, day] = selectedTodo.date
                        .split("-")
                        .map(Number);
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

          <div className="flex flex-col gap-3">
            <div className="text-neutral-900 text-base font-semibold leading-snug">
              날짜
            </div>
            <DateField value={date} onChange={setDate} />
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-neutral-900 text-base font-semibold leading-snug">
              목표 달성 시간
            </div>
            <div className="text-zinc-600 text-sm leading-tight mb-[12px]">
              언제든 수정 가능하니 부담없이 설정해 보세요
            </div>
            <DurationField seconds={target} onChange={setTarget} />
          </div>
        </div>

        {type == "select" ? (
          <button
            type="button"
            onClick={() =>
              isValid &&
              onSubmit?.({
                categoryId,
                title: title.trim(),
                date,
                targetSeconds: target,
              })
            }
            disabled={!isValid}
            className={clsx(
              "w-40 h-12 px-6 py-3 rounded-2xl inline-flex justify-center items-center",
              isValid
                ? "bg-red-500 text-neutral-50"
                : "bg-gray-200 text-gray-400",
            )}
          >
            할 일 선택
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              isValid &&
              onSubmit?.({
                categoryId,
                title: title.trim(),
                date,
                targetSeconds: target,
              })
            }
            disabled={!isValid}
            className={clsx(
              "w-40 h-12 px-6 py-3 rounded-2xl inline-flex justify-center items-center",
              isValid
                ? "bg-red-500 text-neutral-50"
                : "bg-gray-200 text-gray-400",
            )}
          >
            {type == "edit" ? "작업 수정" : "작업 추가"}
          </button>
        )}
      </div>
    </div>
  );
}
