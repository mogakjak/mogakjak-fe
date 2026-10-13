"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import Icon from "@/app/_components/common/Icons";
import Book from "/Icons/book.svg";
import WorkCalendar from "./workCalendar";
import { formatRecentDateLabel } from "@/app/_utils/date";
import type { Todo } from "@/app/_types/todo";

const MAX_TASK_LENGTH = 35;

type WorkComboboxProps = {
  categoryName: string;
  /** 선택된 카테고리의 전체 작업(모든 날짜) */
  todos: Todo[];
  selectedTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (todo: Todo) => void;
  onCreate: (title: string) => void;
  disabled?: boolean;
};

export default function WorkCombobox({
  categoryName,
  todos,
  selectedTitle,
  open,
  onOpenChange,
  onSelect,
  onCreate,
  disabled = false,
}: WorkComboboxProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"recent" | "calendar">("recent");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      return;
    }
    setQuery("");
    setView("recent");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  /** 같은 이름의 작업은 가장 최근 날짜 하나만 노출 */
  const recentTodos = useMemo(() => {
    const sorted = [...todos].sort((a, b) => b.date.localeCompare(a.date));
    const seen = new Set<string>();
    return sorted.filter((todo) => {
      if (seen.has(todo.task)) return false;
      seen.add(todo.task);
      return true;
    });
  }, [todos]);

  const trimmed = query.trim();

  const filteredTodos = useMemo(() => {
    if (!trimmed) return recentTodos;
    const keyword = trimmed.toLowerCase();
    return recentTodos.filter((todo) =>
      todo.task.toLowerCase().includes(keyword),
    );
  }, [recentTodos, trimmed]);

  const exactMatch = useMemo(
    () => recentTodos.find((todo) => todo.task === trimmed),
    [recentTodos, trimmed],
  );
  const isNew = trimmed.length > 0 && !exactMatch;

  const submitQuery = () => {
    if (!trimmed) return;
    if (exactMatch) {
      onSelect(exactMatch);
      return;
    }
    onCreate(trimmed);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        className={clsx(
          "h-11 w-full pl-3 pr-2 bg-gray-100 rounded-lg flex items-center gap-2 transition-shadow",
          isNew && open
            ? "outline-2 outline-red-200 shadow-[0_0_8px_0_rgba(250,83,50,0.25)]"
            : "outline-1 outline-gray-200",
          disabled && "opacity-60 cursor-not-allowed",
        )}
        onClick={() => {
          if (!disabled && !open) onOpenChange(true);
        }}
      >
        <Icon Svg={Book} size={20} className="shrink-0 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={open ? query : (selectedTitle ?? "")}
          disabled={disabled}
          maxLength={MAX_TASK_LENGTH}
          onFocus={() => {
            if (!open) onOpenChange(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value.slice(0, MAX_TASK_LENGTH));
            setView("recent");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submitQuery();
            } else if (e.key === "Escape") {
              onOpenChange(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={
            open && selectedTitle ? selectedTitle : "할 일 검색 또는 새로 입력"
          }
          className="flex-1 min-w-0 bg-transparent outline-none text-body2-14R text-gray-800 placeholder:text-gray-400 disabled:cursor-not-allowed"
        />
        {isNew && open && (
          <button
            type="button"
            onClick={submitQuery}
            className="shrink-0 px-2.5 py-1 rounded-md bg-red-500 text-caption-12SB text-white"
          >
            적용
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-2 p-2 bg-neutral-50 rounded-[10px] border border-gray-100 shadow-[0_0_10px_0_rgba(0,0,0,0.1)]">
          {view === "calendar" ? (
            <WorkCalendar
              todos={todos}
              categoryName={categoryName}
              onBack={() => setView("recent")}
              onSelect={onSelect}
            />
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2 px-1 pb-1">
                <p className="text-caption-12R text-gray-500 truncate">
                  ‘{categoryName}’ 카테고리의 작업
                </p>
                <button
                  type="button"
                  onClick={() => setView("calendar")}
                  className="shrink-0 text-caption-12SB text-red-500"
                >
                  달력으로 보기 →
                </button>
              </div>

              <div className="flex flex-col max-h-[220px] overflow-y-auto">
                {filteredTodos.map((todo) => (
                  <button
                    key={todo.id}
                    type="button"
                    onClick={() => onSelect(todo)}
                    className="w-full px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 text-left hover:bg-gray-100"
                  >
                    <span className="text-body2-14R text-gray-800 truncate">
                      {todo.task}
                    </span>
                    <span className="shrink-0 text-caption-12R text-gray-400">
                      {formatRecentDateLabel(todo.date)}
                    </span>
                  </button>
                ))}
              </div>

              {isNew ? (
                <p className="px-3 py-2.5 text-center text-caption-12R text-gray-400">
                  ↳ 새로 입력한 내용은 오늘의 새 할 일로 저장
                </p>
              ) : (
                filteredTodos.length === 0 && (
                  <p className="px-3 py-2.5 text-center text-caption-12R text-gray-400">
                    아직 등록된 작업이 없어요
                  </p>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
