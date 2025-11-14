"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import clsx from "clsx";
import WorkItem from "./workItem";
import Image from "next/image";
import AddWorkForm, { AddWorkPayload } from "./addWorkForm";
import type { CategoryOption } from "./categorySelect";
import type { Category } from "@/app/_types/category";

export type TodoListProps = {
  dateLabel?: string;
  categories: Category[];
  onAddWork?: (categoryId: Category["id"]) => void;
  onToggleCategory?: (categoryId: Category["id"], expanded: boolean) => void;
  onCreateTodo?: (payload: {
    categoryId: string;
    title: string;
    date: Date;
    targetSeconds: number;
  }) => Promise<void> | void;
  onUpdateTodo?: (payload: {
    todoId: string;
    categoryId: string;
    title: string;
    date: Date;
    targetSeconds: number;
  }) => Promise<void> | void;
  onDeleteTodo?: (todoId: string) => Promise<void> | void;
  onToggleTodo?: (todoId: string, next: boolean) => Promise<void> | void;
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
      <div className="flex-1 h-11 rounded-lg outline-1 outline-gray-200 flex justify-start items-center overflow-hidden">
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
          src={expanded ? "/Icons/arrowUpGray.svg" : "/Icons/arrowDownGray.svg"}
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
  categories,
  onToggleCategory,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleTodo,
  className,
}: TodoListProps) {
  const [openMap, setOpenMap] = useState<Record<string | number, boolean>>(() =>
    categories.reduce((acc, c) => {
      acc[c.id] = c.expanded ?? true;
      return acc;
    }, {} as Record<string | number, boolean>)
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | number | null
  >(null);
  const [editingTodo, setEditingTodo] = useState<{
    id: string;
    categoryId: string;
    title: string;
    date: Date | string;
    targetSeconds: number;
  } | null>(null);

  useEffect(() => {
    setOpenMap((prev) => {
      const next = { ...prev };
      let changed = false;
      categories.forEach((cat) => {
        if (!(cat.id in next)) {
          next[cat.id] = cat.expanded ?? true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [categories]);

  const toggle = (id: Category["id"]) => {
    setOpenMap((m) => {
      const next = { ...m, [id]: !m[id] };
      onToggleCategory?.(id, next[id]);
      return next;
    });
  };

  const handleAddClick = (catId: Category["id"]) => {
    setSelectedCategoryId(catId);
    setModalType("add");
    setEditingTodo(null);
    setModalOpen(true);
  };

  const handleEditClick = (todo: {
    id: string;
    categoryId: string;
    title: string;
    date: Date | string;
    targetSeconds: number;
  }) => {
    let todoDate: Date;
    if (typeof todo.date === "string") {
      // YYYY-MM-DD 형식인 경우
      const [year, month, day] = todo.date.split("-").map(Number);
      todoDate = new Date(year, month - 1, day);
    } else {
      todoDate = todo.date;
    }
    setEditingTodo({
      ...todo,
      date: todoDate,
    });
    setSelectedCategoryId(todo.categoryId);
    setModalType("edit");
    setModalOpen(true);
  };

  const handleSubmit = async (payload: AddWorkPayload) => {
    if (modalType === "edit" && editingTodo) {
      await onUpdateTodo?.({
        todoId: editingTodo.id,
        categoryId: payload.categoryId,
        title: payload.title,
        date: payload.date,
        targetSeconds: payload.targetSeconds,
      });
    } else {
      if (!selectedCategoryId) return;
      await onCreateTodo?.({
        categoryId: String(selectedCategoryId),
        title: payload.title,
        date: payload.date,
        targetSeconds: payload.targetSeconds,
      });
    }
    setModalOpen(false);
    setEditingTodo(null);
  };

  const categoryOptions = useMemo<CategoryOption[]>(
    () =>
      categories.map((c) => ({
        id: String(c.id),
        name: c.title,
        colorToken: c.colorToken ?? "category-1-red",
      })),
    [categories]
  );

  return (
    <>
      <div
        className={clsx(
          "w-full inline-flex flex-col items-stretch gap-6 pt-7",
          className
        )}
      >
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
                        key={w.id ?? `${cat.id}-${idx}`}
                        {...w}
                        onToggleCompleted={(next) =>
                          w.id ? onToggleTodo?.(w.id, next) : undefined
                        }
                        onEdit={() => {
                          if (w.id) {
                            handleEditClick({
                              id: w.id,
                              categoryId: String(cat.id),
                              title: w.title,
                              date: w.date,
                              targetSeconds: w.targetSeconds,
                            });
                          }
                        }}
                        onDelete={() => {
                          if (w.id) {
                            onDeleteTodo?.(w.id);
                          }
                        }}
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
            type={modalType}
            categories={categoryOptions}
            initialValues={
              editingTodo
                ? {
                    categoryId: editingTodo.categoryId,
                    title: editingTodo.title,
                    date: editingTodo.date instanceof Date ? editingTodo.date : new Date(editingTodo.date),
                    targetSeconds: editingTodo.targetSeconds,
                  }
                : selectedCategoryId
                ? {
                    categoryId: String(selectedCategoryId),
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onClose={() => {
              setModalOpen(false);
              setEditingTodo(null);
            }}
          />
        </div>
      )}
    </>
  );
}
