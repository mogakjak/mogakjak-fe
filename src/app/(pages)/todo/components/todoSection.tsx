"use client";

import clsx from "clsx";
import TodoList, { type Category as CategoryType } from "./todoList";
import type { DayFilter } from "./category";

export default function TodoSection({
  filter,
  dateLabel,
  categories,
  onAddWork,
  onToggleCategory,
  className,
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
    <section
      className={clsx(
        "w-full h-[856px] bg-white rounded-[20px] p-6 flex flex-col",
        className,
      )}
    >
      {isToday ? (
        <div className="flex items-baseline gap-3 mb-4">
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
        <h2 className="text-neutral-900 text-xl font-semibold font-['Pretendard'] leading-7 mb-4">
          전체 투두리스트
        </h2>
      )}

      <div className="flex-1 overflow-y-auto">
        <TodoList
          categories={categories}
          onAddWork={onAddWork}
          onToggleCategory={onToggleCategory}
        />
      </div>
    </section>
  );
}
