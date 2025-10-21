"use client";

import { useState, Fragment } from "react";
import clsx from "clsx";
import WorkItem, { WorkItemProps } from "./workItem";
import Image from "next/image";
import AddWorkForm, { AddWorkPayload } from "./addWorkForm";
import { CategoryOption } from "./categorySelect"; 

export type Category = {
  id: string | number;
  title: string;
  barColorClass: string;
  items: WorkItemProps[];
  expanded?: boolean;
};

export type TodoListProps = {
  dateLabel?: string;
  categories: Category[];
  onAddWork?: (categoryId: Category["id"]) => void;
  onToggleCategory?: (categoryId: Category["id"], expanded: boolean) => void;
  className?: string;
};

function CategoryHeader({
  category,
  expanded,
  onToggle,
  onAdd,
}: {
  category: Category;
  expanded: boolean;
  onToggle: () => void;
  onAdd?: () => void;
}) {
  return (
    <div className="self-stretch inline-flex justify-start items-center gap-1">
      <div className="flex-1 h-11 rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center overflow-hidden">
        <div className={clsx("w-3 self-stretch", category.barColorClass)} />
        <div className="flex-1 self-stretch px-4 py-2.5 bg-gray-100 flex justify-between items-center overflow-hidden">
          <div className="text-neutral-900 text-base font-semibold leading-snug">
            {category.title}
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="p-1 rounded-lg flex justify-start items-center gap-2"
          >
            <Image
              src="/Icons/plusRed.svg"
              alt="추가"
              className="w-6 h-6 cursor-pointer"
              width={24}
              height={24}
            />
            <span className="text-zinc-600 text-sm leading-tight">
              할 일 추가하기
            </span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={expanded ? "접기" : "펼치기"}
        className="w-6 h-6 grid place-items-center"
      >
        <Image
          src={expanded ? "/icons/arrowUpGray.svg" : "/icons/arrowDownGray.svg"}
          alt={expanded ? "위로" : "아래로"}
          className="w-6 h-6"
          width={24}
          height={24}
        />
      </button>
    </div>
  );
}

export default function TodoList({
  categories: initialCategories,
  onToggleCategory,
  className,
}: TodoListProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const [openMap, setOpenMap] = useState<Record<string | number, boolean>>(() =>
    initialCategories.reduce(
      (acc, c) => {
        acc[c.id] = c.expanded ?? true;
        return acc;
      },
      {} as Record<string | number, boolean>,
    ),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | number | null
  >(null);

  const toggle = (id: Category["id"]) => {
    setOpenMap((m) => {
      const next = { ...m, [id]: !m[id] };
      onToggleCategory?.(id, next[id]);
      return next;
    });
  };

  const toggleItemCompleted = (catId: Category["id"], idx: number, next: boolean) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.map((it, i) => (i === idx ? { ...it, completed: next } : it)) }
          : c,
      ),
    );
  };
  const handleAddClick = (catId: Category["id"]) => {
    setSelectedCategoryId(catId);
    setModalOpen(true);
  };
  const handleAddWork = (payload: AddWorkPayload) => {
    if (!selectedCategoryId) return;
    setCategories((prev) =>
      prev.map((c) =>
        c.id === selectedCategoryId
          ? {
              ...c,
              items: [
                ...c.items,
                {
                  date: payload.date,
                  title: payload.title,
                  targetSeconds: payload.targetSeconds,
                  currentSeconds: 0,
                  completed: false,
                },
              ],
            }
          : c,
      ),
    );
    setModalOpen(false);
  };

  return (
    <>
      <div className={clsx("w-full inline-flex flex-col items-stretch gap-6 pt-7", className)}>
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          {categories.map((cat) => {
            const expanded = openMap[cat.id] ?? true;
            return (
              <Fragment key={cat.id}>
                <CategoryHeader
                  category={cat}
                  expanded={expanded}
                  onToggle={() => toggle(cat.id)}
                  onAdd={() => handleAddClick(cat.id)}
                />
                {expanded && (
                  <div className="self-stretch pl-4 pr-7 flex flex-col justify-start items-start gap-2">
                    {cat.items.map((w, idx) => (
                      <WorkItem
                        key={`${cat.id}-${idx}`}
                        {...w}
                        onToggleCompleted={(next) => toggleItemCompleted(cat.id, idx, next)}
                        className="self-stretch w-full"
                      />
                    ))}
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <AddWorkForm
            categories={categories.map((c) => ({
              id: String(c.id),
              name: c.title,
              colorToken: "category-1-red" as CategoryOption["colorToken"],
            }))}
            onSubmit={handleAddWork}
            onClose={() => setModalOpen(false)}
          />
        </div>
      )}
    </>
  );
}
