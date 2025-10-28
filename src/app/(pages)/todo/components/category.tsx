"use client";

import clsx from "clsx";
import Image from "next/image";
import { memo, useState } from "react";
import FilterPill from "./filterPill";
import CategoryRow from "./categoryRow";

export type DayFilter = "today" | "all";
export type Category = { id: string; name: string; color: string };

function Category({
  filter,
  onChangeFilter,
  categories,
  selectedId,
  onSelect,
  className,
}: {
  filter: DayFilter;
  onChangeFilter?: (f: DayFilter) => void;
  categories: Category[];
  selectedId: string;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const [categoryList, setCategoryList] = useState(categories);
  const [editingId, setEditingId] = useState<string | null>(null);

  const CATEGORY_COLORS = [
    "bg-category-1-red",
    "bg-category-2-orange",
    "bg-category-3-yellow",
    "bg-category-4-green",
    "bg-category-5-skyblue",
    "bg-category-6-blue",
    "bg-category-7-purple",
  ];

  const handleAddCategory = () => {
    const nextIndex = categoryList.length % CATEGORY_COLORS.length;
    const color = CATEGORY_COLORS[nextIndex];
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: "새로운 카테고리",
      color,
    };
    setCategoryList((prev) => [...prev, newCategory]);
    setEditingId(newCategory.id);
  };

  const handleRename = (id: string, newName: string) => {
    setCategoryList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c)),
    );
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setCategoryList((prev) => prev.filter((c) => c.id !== id));
  };

  const moveUp = (id: string) => {
    setCategoryList((prev) => {
      const i = prev.findIndex((c) => c.id === id);
      if (i <= 0) return prev;
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  };

  const moveDown = (id: string) => {
    setCategoryList((prev) => {
      const i = prev.findIndex((c) => c.id === id);
      if (i < 0 || i === prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  };

  const reorder = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setCategoryList((prev) => {
      const fromIdx = prev.findIndex((c) => c.id === fromId);
      const toIdx = prev.findIndex((c) => c.id === toId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  return (
    <section
      className={clsx(
        "w-[327px] h-[856px] px-6 py-9 rounded-[20px] bg-neutral-50 inline-flex flex-col gap-7",
        className,
      )}
    >
      <h2 className="text-xl font-semibold text-neutral-900 leading-7">ToDo</h2>

      <div className="flex flex-col gap-5 flex-1 overflow-y-auto">
        <div className="flex gap-2 my-2 mx-0.5">
          <FilterPill
            selected={filter === "today"}
            onClick={() => onChangeFilter?.("today")}
            icon="/Icons/todoToday.svg"
            label="오늘"
          />
          <FilterPill
            selected={filter === "all"}
            onClick={() => onChangeFilter?.("all")}
            icon="/Icons/todoAll.svg"
            label="전체"
          />
        </div>

        <div className="h-px w-full bg-gray-200" />

        <div className="flex flex-col gap-4">
          <h3 className="text-base font-semibold text-neutral-900">카테고리</h3>
          <CategoryRow
            id="all"
            index={-1}
            label="전체"
            colorToken="bg-gray-500"
            selected={selectedId === "all"}
            onSelect={() => onSelect?.("all")}
            showHandle={false}
          />

          <div className="flex flex-col gap-3">
            {categoryList.map((c, idx) => (
              <CategoryRow
                key={c.id}
                id={c.id}
                index={idx}
                label={c.name}
                colorToken={c.color}
                selected={selectedId === c.id}
                onSelect={() => onSelect?.(c.id)}
                showHandle
                editable={editingId === c.id}
                onRename={(newName) => handleRename(c.id, newName)}
                onDelete={handleDelete}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                onReorder={reorder}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddCategory}
            className="h-11 w-full rounded-lg bg-gray-200 inline-flex items-center gap-2 px-4"
          >
            <Image
              src="/Icons/plusFilled.svg"
              alt="추가"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="text-base text-neutral-700 font-normal">
              새 카테고리 추가하기
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default memo(Category);
