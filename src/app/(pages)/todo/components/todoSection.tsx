"use client";

import TodoList, { type Category as CategoryType } from "./todoList";
import type { DayFilter } from "./category";

export default function TodoSection({
  filter,
  dateLabel,
  categories,
}: {
  filter: DayFilter;
  dateLabel?: string;
  categories: CategoryType[];
  onAddWork?: (categoryId: CategoryType["id"]) => void;
  onToggleCategory?: (categoryId: CategoryType["id"], expanded: boolean) => void;
  className?: string;
}) {
  const isToday = filter === "today";

  return (
    <section className="w-full flex-1 min-h-[856px] bg-white rounded-[20px] p-6 flex flex-col">
  {isToday ? (
    <div className="flex items-baseline gap-3 mb-0">
      <h2 className="text-neutral-900 text-xl font-semibold font-['Pretendard'] leading-7">
        오늘의 투두리스트
      </h2>
      {dateLabel && (
        <span className="text-gray-400 text-base font-semibold font-['Pretendard'] leading-snug">
          {dateLabel}
        </span>
      )}
    </div>
  ) : (
    <h2 className="text-neutral-900 text-xl font-semibold font-['Pretendard'] leading-7 mb-0">
      전체 투두리스트
    </h2>
  )}

  <div className="flex-1 overflow-y-auto">
    <TodoList categories={categories} className="w-full" />
  </div>
</section>
  );
}
