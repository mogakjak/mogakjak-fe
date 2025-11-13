"use client";

import { useCallback, useMemo, useState } from "react";
import CategorySidebar, {
  type Category as CatType,
  type DayFilter,
} from "./components/category";
import TodoSection from "./components/todoSection";
import { categoriesData } from "@/app/_utils/mockData";
import {
  CATEGORY_COLOR_NAME_BY_TOKEN,
  CATEGORY_COLOR_TOKEN_BY_NAME,
  useTodoCategoryController,
} from "@/app/_hooks/todoCategory";

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
  const {
    categories,
    createCategory,
    deleteCategory,
    reorderCategories,
  } = useTodoCategoryController();

  const dateLabel = useMemo(() => getKoreanDateLabel(), []);
  const sidebarCategories = useMemo<CatType[]>(
    () =>
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        colorToken: CATEGORY_COLOR_TOKEN_BY_NAME[category.color] ?? "bg-category-1-red",
        isNew: false,
      })),
    [categories],
  );

  const handleCreateCategory = useCallback(
    async ({ name, colorToken }: { name: string; colorToken: string }) => {
      const color = CATEGORY_COLOR_NAME_BY_TOKEN[colorToken] ?? "RED";
      const created = await createCategory({ name, color });
      return {
        id: created.id,
        name: created.name,
        colorToken: CATEGORY_COLOR_TOKEN_BY_NAME[created.color] ?? colorToken,
      };
    },
    [createCategory],
  );

  const handleDeleteCategory = useCallback(
    async (categoryId: string) => {
      await deleteCategory(categoryId);
    },
    [deleteCategory],
  );

  const handleReorderCategories = useCallback(
    async (categoryIds: string[]) => {
      if (categoryIds.length === 0) return;
      await reorderCategories({ categoryIds });
    },
    [reorderCategories],
  );

  return (
    <main className="min-h-screen bg-gray-100 flex">
      <div className="shrink-0">
        <CategorySidebar
          filter={filter}
          onChangeFilter={setFilter}
          categories={sidebarCategories}
          selectedId={selectedId}
          onSelect={setSelectedId}
          className="mt-10 ml-10"
          onCreateCategory={handleCreateCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCategories={handleReorderCategories}
        />
      </div>

      <div className="flex-1 p-10">
        <TodoSection
          filter={filter}
          dateLabel={dateLabel}
          categories={categoriesData}
          className="mb-6"
        />
      </div>
    </main>
  );
}
