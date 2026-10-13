"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { monthMatrix } from "@/app/(pages)/todo/components/dateField";
import { parseLocalDateString, toLocalDateString } from "@/app/_utils/date";
import type { Todo } from "@/app/_types/todo";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatTarget(seconds: number | null) {
  if (!seconds || seconds <= 0) return "목표 없음";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours && minutes) return `${hours}시간 ${minutes}분`;
  if (hours) return `${hours}시간`;
  return `${minutes}분`;
}

type WorkCalendarProps = {
  todos: Todo[];
  categoryName: string;
  onBack: () => void;
  onSelect: (todo: Todo) => void;
};

export default function WorkCalendar({
  todos,
  categoryName,
  onBack,
  onSelect,
}: WorkCalendarProps) {
  const [view, setView] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() =>
    toLocalDateString(new Date()),
  );

  const cells = useMemo(() => monthMatrix(view), [view]);

  const datesWithTodos = useMemo(
    () => new Set(todos.map((todo) => todo.date)),
    [todos],
  );

  const todosOnSelectedDate = useMemo(
    () => todos.filter((todo) => todo.date === selectedDate),
    [todos, selectedDate],
  );

  const selectedDateObj = parseLocalDateString(selectedDate);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="text-caption-12SB text-red-500"
        >
          ← 최근 작업
        </button>
        <p className="text-body2-14SB text-gray-800">
          {view.getFullYear()}년 {view.getMonth() + 1}월
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="이전 달"
            onClick={() =>
              setView((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
            }
          >
            <Image
              src="/Icons/arrowRight.svg"
              alt=""
              width={16}
              height={16}
              className="w-4 h-4 opacity-40"
            />
          </button>
          <button
            type="button"
            aria-label="다음 달"
            onClick={() =>
              setView((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
            }
          >
            <Image
              src="/Icons/arrowLeft.svg"
              alt=""
              width={16}
              height={16}
              className="w-4 h-4 opacity-40"
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="h-6 flex items-center justify-center text-caption-12R text-gray-500"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map(({ date, type }) => {
          const dateStr = toLocalDateString(date);
          const isSelected = dateStr === selectedDate;
          const hasTodo = datesWithTodos.has(dateStr);
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => {
                setSelectedDate(dateStr);
                if (type !== "curr") {
                  setView(new Date(date.getFullYear(), date.getMonth(), 1));
                }
              }}
              className={clsx(
                "w-8 h-8 mx-auto rounded-lg flex flex-col items-center justify-center transition-colors",
                isSelected
                  ? "bg-red-500 text-white"
                  : type === "curr"
                    ? "text-gray-800 hover:bg-gray-100"
                    : "text-gray-400 hover:bg-gray-100",
              )}
            >
              <span className="text-caption-12R leading-none">
                {date.getDate()}
              </span>
              <span
                className={clsx(
                  "w-1 h-1 mt-0.5 rounded-full",
                  hasTodo
                    ? isSelected
                      ? "bg-white"
                      : "bg-red-500"
                    : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="h-px w-full bg-gray-200 my-2" />

      <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto">
        {todosOnSelectedDate.length === 0 ? (
          <p className="py-2 text-center text-caption-12R text-gray-400">
            이 날 등록된 작업이 없어요
          </p>
        ) : (
          todosOnSelectedDate.map((todo) => (
            <button
              key={todo.id}
              type="button"
              onClick={() => onSelect(todo)}
              className="w-full px-2 py-1.5 rounded-lg flex items-center justify-between gap-2 text-left hover:bg-gray-100"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-body2-14R text-gray-800 truncate">
                  {todo.task}
                </span>
                <span className="text-caption-12R text-gray-400">
                  {categoryName} · {selectedDateObj.getMonth() + 1}월{" "}
                  {selectedDateObj.getDate()}일
                </span>
              </div>
              <span className="shrink-0 text-caption-12R text-gray-500">
                {formatTarget(todo.targetTimeInSeconds)}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
