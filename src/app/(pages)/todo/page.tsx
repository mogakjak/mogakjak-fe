"use client";

import { useMemo, useState } from "react";
import CategorySidebar, {
  type Category as CatType,
  type DayFilter,
} from "./components/category";
import TodoSection from "./components/todoSection";
import type { Category as ListCategory } from "./components/todoList";

function getKoreanDateLabel(d = new Date()) {
  const days = ["일", "월", "화", "수", "목", "금", "토"] as const;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const day = days[d.getDay()];
  return `${yyyy}.${mm}.${dd}(${day})`;
}

export default function TodoPage() {
  const [filter, setFilter] = useState<DayFilter>("today");
  const [selectedId, setSelectedId] = useState<string>("all");

  const categories: ListCategory[] = [
    {
      id: 1,
      title: "카테고리 예시 가나다",
      barColorClass: "bg-red-400",
      expanded: true,
      items: [
        {
          date: "2025.10.14",
          title: "할 일 예시 가나다라마바사",
          targetSeconds: 10800,
          currentSeconds: 5400,
          completed: false,
        },
        {
          date: "2025.10.14",
          title: "할 일 예시 가나다라마바사",
          targetSeconds: 10800,
          currentSeconds: 10800,
          completed: true,
        },
      ],
    },
    {
      id: 2,
      title: "카테고리 예시 가나다",
      barColorClass: "bg-orange-300",
      expanded: true,
      items: [
        {
          date: "2025.10.14",
          title: "할 일 예시 가나다라마바사",
          targetSeconds: 10800,
          currentSeconds: 5400,
          completed: false,
        },
      ],
    },
  ];

  const dateLabel = useMemo(() => getKoreanDateLabel(), []);

  return (
    <main className="min-h-screen bg-gray-100 flex">
      <div className="shrink-0">
        <CategorySidebar
          filter={filter}
          onChangeFilter={setFilter}
          categories={[] as CatType[]}
          selectedId={selectedId}
          onSelect={setSelectedId}
          className="mt-10 ml-10"
        />
      </div>

      <div className="flex-1 p-10">
        <TodoSection
          filter={filter}
          dateLabel={dateLabel}
          categories={categories}
          className="mb-6"
        />
      </div>
    </main>
  );
}
