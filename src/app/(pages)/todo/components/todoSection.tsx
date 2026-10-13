"use client";

import TodoList from "./todoList";
import FilterPill from "./filterPill";
import type { Category as CategoryType } from "@/app/_types/category";
import type { DayFilter } from "./category";
import type { CategoryOption } from "./categorySelect";

export default function TodoSection({
  filter,
  onChangeFilter,
  dateLabel,
  categories,
  allCategories,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleTodo,
  onCategorySelect,
}: {
  filter: DayFilter;
  onChangeFilter?: (f: DayFilter) => void;
  dateLabel?: string;
  categories: CategoryType[];
  allCategories?: CategoryOption[];
  onAddWork?: (categoryId: CategoryType["id"]) => void;
  onToggleCategory?: (
    categoryId: CategoryType["id"],
    expanded: boolean
  ) => void;
  onCreateTodo?: Parameters<typeof TodoList>[0]["onCreateTodo"];
  onUpdateTodo?: Parameters<typeof TodoList>[0]["onUpdateTodo"];
  onDeleteTodo?: Parameters<typeof TodoList>[0]["onDeleteTodo"];
  onToggleTodo?: Parameters<typeof TodoList>[0]["onToggleTodo"];
  onCategorySelect?: Parameters<typeof TodoList>[0]["onCategorySelect"];
  className?: string;
}) {
  const isToday = filter === "today";

  return (
    <section className="w-full h-full bg-white rounded-[20px] p-6 flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-neutral-900 text-xl font-semibold font-['Pretendard'] leading-7">
            {isToday ? "오늘의 작업 목록" : "전체 작업 목록"}
          </h2>
          {isToday && dateLabel && (
            <span className="text-gray-400 text-base font-semibold font-['Pretendard'] leading-snug">
              {dateLabel}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <FilterPill
            selected={filter === "all"}
            onClick={() => onChangeFilter?.("all")}
            icon="/Icons/todoAll.svg"
            label="전체"
          />
          <FilterPill
            selected={filter === "today"}
            onClick={() => onChangeFilter?.("today")}
            icon="/Icons/todoToday.svg"
            label="오늘"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <TodoList
          categories={categories}
          allCategories={allCategories}
          emptyMessage={
            isToday
              ? undefined
              : "등록된 작업이 없어요!\n카테고리에서 작업을 추가해 보세요."
          }
          className="w-full"
          onCreateTodo={onCreateTodo}
          onUpdateTodo={onUpdateTodo}
          onDeleteTodo={onDeleteTodo}
          onToggleTodo={onToggleTodo}
          onCategorySelect={onCategorySelect}
        />
      </div>
    </section>
  );
}
