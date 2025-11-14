"use client";

import clsx from "clsx";
import Image from "next/image";
import { memo, useEffect, useState } from "react";
import FilterPill from "./filterPill";
import CategoryRow from "./categoryRow";
import { CATEGORY_COLOR_TOKENS } from "@/app/_hooks/todoCategory";

export type DayFilter = "today" | "all";
export type Category = {
  id: string;
  name: string;
  colorToken: string;
  isNew?: boolean;
  isSaving?: boolean;
};

type CreateCategoryResult = Pick<Category, "id" | "name" | "colorToken"> | void;

function Category({
  filter,
  onChangeFilter,
  categories,
  selectedId,
  onSelect,
  className,
  onCreateCategory,
  onDeleteCategory,
  onReorderCategories,
}: {
  filter: DayFilter;
  onChangeFilter?: (f: DayFilter) => void;
  categories: Category[];
  selectedId: string;
  onSelect?: (id: string) => void;
  className?: string;
  onCreateCategory?: (payload: { name: string; colorToken: string }) => Promise<CreateCategoryResult>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onReorderCategories?: (categoryIds: string[]) => Promise<void>;
}) {
  const [categoryList, setCategoryList] = useState<Category[]>(categories);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setCategoryList((prev) => {
      const base: Category[] = categories.map(
        (c) =>
          ({
            ...c,
            colorToken: c.colorToken?.startsWith("bg-")
              ? (c.colorToken.slice(3) as Category["colorToken"])
              : c.colorToken,
            isNew: false,
          }) satisfies Category,
      );
      const baseIds = new Set(base.map((c) => c.id));
      // prev에서 isNew 상태인 항목만 필터링
      const newItems = prev.filter((item) => item.isNew === true);
      // base + isNew인 항목들만 합치기
      const merged: Category[] = [...base];
      for (const item of newItems) {
        if (!baseIds.has(item.id)) {
          merged.push(item);
        }
      }
      
      return merged;
    });
  }, [categories]);

  const handleAddCategory = async () => {
    const nextIndex = categoryList.length % CATEGORY_COLOR_TOKENS.length;
    const colorToken = CATEGORY_COLOR_TOKENS[nextIndex];
    const tempId = crypto.randomUUID();
    const placeholder: Category = {
      id: tempId,
      name: "",
      colorToken,
      isNew: true,
      isSaving: false,
    };
    setCategoryList((prev) => [...prev, placeholder]);
    setEditingId(tempId);
  };

  const handleRename = async (id: string, newName: string, reason: "enter" | "blur") => {
    const trimmed = newName.trim();
    const target = categoryList.find((c) => c.id === id);
    if (!target) return true;

    if (target.isNew) {
      if (target.isSaving) {
        return true;
      }
      if (reason !== "enter" || !trimmed) {
        setEditingId(id);
        return false;
      }
      setCategoryList((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                name: trimmed,
                isSaving: true,
              }
            : c,
        ),
      );
      try {
        const created = await onCreateCategory?.({ name: trimmed, colorToken: target.colorToken });
        if (created) {
          const serverId = created.id;
          const nextColorToken = created.colorToken ?? target.colorToken;
          setCategoryList((prev) =>
            prev.map((c) =>
              c.id === id
                ? {
                    id: serverId,
                    name: created.name,
                    colorToken: nextColorToken,
                    isNew: false,
                    isSaving: false,
                  }
                : c,
            ),
          );
          if (selectedId === id) {
            onSelect?.(serverId);
          }
          setEditingId(null);
          return true;
        }
      } catch (error) {
        console.error("카테고리 생성에 실패했습니다.", error);
        setCategoryList((prev) => prev.filter((c) => c.id !== id));
        setEditingId(null);
      }
      return true;
    }

    setEditingId(null);
    return true;
  };

  const handleDelete = async (id: string) => {
    const prevSnapshot = categoryList;
    const target = categoryList.find((c) => c.id === id);
    setCategoryList((prev) => prev.filter((c) => c.id !== id));
    if (target?.isNew) {
      if (selectedId === id) {
        onSelect?.("all");
      }
      return;
    }
    try {
      await onDeleteCategory?.(id);
    } catch (error) {
      console.error("카테고리 삭제에 실패했습니다.", error);
      setCategoryList(prevSnapshot);
    }
  };

  const commitReorder = async (nextList: Category[]) => {
    const prevSnapshot = categoryList;
    setCategoryList(nextList);
    if (!onReorderCategories) return;
    try {
      await onReorderCategories(nextList.map((c) => c.id));
    } catch (error) {
      console.error("카테고리 순서 변경에 실패했습니다.", error);
      setCategoryList(prevSnapshot);
    }
  };

  const moveUp = (id: string) => {
    const i = categoryList.findIndex((c) => c.id === id);
    if (i <= 0) return;
    const next = [...categoryList];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    void commitReorder(next);
  };

  const moveDown = (id: string) => {
    const i = categoryList.findIndex((c) => c.id === id);
    if (i < 0 || i === categoryList.length - 1) return;
    const next = [...categoryList];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    void commitReorder(next);
  };

  const reorder = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const fromIdx = categoryList.findIndex((c) => c.id === fromId);
    const toIdx = categoryList.findIndex((c) => c.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...categoryList];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    void commitReorder(next);
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
                colorToken={
                  c.colorToken
                    ? `bg-${c.colorToken}`
                    : "bg-category-1-red"
                }
                selected={selectedId === c.id}
                onSelect={() => onSelect?.(c.id)}
                showHandle
                editable={editingId === c.id}
                onRename={(newName, reason) => handleRename(c.id, newName, reason)}
                allowEdit={c.isNew === true && !c.isSaving}
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
