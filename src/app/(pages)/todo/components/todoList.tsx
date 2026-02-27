"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import clsx from "clsx";
import WorkItem from "./workItem";
import Image from "next/image";
import AddWorkForm, { AddWorkPayload } from "./addWorkForm";
import type { CategoryOption } from "./categorySelect";
import type { Category } from "@/app/_types/category";
import SimpleToast from "@/app/_components/common/SimpleToast";
import { useTodoDragAndDrop } from "@/app/_hooks/todo/useTodoDragAndDrop";

export type TodoListProps = {
  dateLabel?: string;
  categories: Category[];
  allCategories?: CategoryOption[];
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
  onCategorySelect?: (categoryId: string) => void;
  className?: string;
};

function CategoryHeader({
  category,
  expanded,
  onToggle,
  onAdd,
  onDrop,
  onDragEnter,
  onDragLeave,
  isDragOver,
}: {
  category: Category;
  expanded: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnter?: () => void;
  onDragLeave?: (e: React.DragEvent) => void;
  isDragOver?: boolean;
}) {
  return (
    <div className="self-stretch inline-flex justify-start items-center gap-1">
      <div
        className={clsx(
          "flex-1 h-11 rounded-lg outline-1 outline-gray-200 flex justify-start items-center overflow-hidden transition-colors",
          isDragOver && "outline-2 outline-blue-400 bg-blue-50",
        )}
        onDragEnter={(e) => {
          e.preventDefault();
          onDragEnter?.();
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            onDragLeave?.(e);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={(e) => {
          e.preventDefault();
          onDrop?.(e);
        }}
      >
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
            <span className="text-zinc-600 text-sm leading-tight">
              작업 추가하기
            </span>
            <Image
              src="/Icons/plusRed.svg"
              alt="추가"
              className="w-6 h-6 cursor-pointer"
              width={24}
              height={24}
            />
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
  allCategories,
  onToggleCategory,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleTodo,
  onCategorySelect,
  className,
}: TodoListProps) {
  const [openMap, setOpenMap] = useState<Record<string | number, boolean>>(() =>
    categories.reduce(
      (acc, c) => {
        // 할일이 있으면 expanded ?? true, 없으면 false
        acc[c.id] = c.items.length > 0 ? (c.expanded ?? true) : false;
        return acc;
      },
      {} as Record<string | number, boolean>,
    ),
  );
  const [toast, setToast] = useState<{ isVisible: boolean; message: string }>({
    isVisible: false,
    message: "",
  });

  const triggerToast = (message: string) => {
    setToast({ isVisible: true, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 2000);
  };

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

  const {
    draggedTodo,
    dragOverCategoryId,
    setDragOverCategoryId,
    handleDragStart,
    handleDragEnd,
    handleDropOnCategory,
  } = useTodoDragAndDrop({
    categories,
    onUpdateTodo,
    onToast: triggerToast,
  });

  useEffect(() => {
    setOpenMap((prev) => {
      const next = { ...prev };
      let changed = false;
      categories.forEach((cat) => {
        const shouldBeOpen =
          cat.items.length > 0 ? (cat.expanded ?? true) : false;
        if (!(cat.id in next) || next[cat.id] !== shouldBeOpen) {
          next[cat.id] = shouldBeOpen;
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

  const categoryOptions = useMemo<CategoryOption[]>(() => {
    if (allCategories && allCategories.length > 0) {
      return allCategories;
    }
    return categories.map((c) => ({
      id: String(c.id),
      name: c.title,
      colorToken: c.colorToken ?? "category-1-red",
    }));
  }, [categories, allCategories]);

  const totalItemsCount = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.items.length, 0),
    [categories],
  );

  return (
    <>
      <SimpleToast
        isVisible={toast.isVisible}
        message={toast.message}
        position="top"
      />
      <div
        className={clsx(
          "w-full inline-flex flex-col items-stretch gap-6 pt-7",
          className,
        )}
      >
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          {categories.map((cat) => {
            const expanded =
              cat.items.length > 0 ? (openMap[cat.id] ?? true) : false;
            return (
              <Fragment key={cat.id}>
                <CategoryHeader
                  category={cat}
                  expanded={expanded}
                  onToggle={() => toggle(cat.id)}
                  onAdd={() => handleAddClick(cat.id)}
                  onDrop={(e) => handleDropOnCategory(e, cat.id)}
                  onDragEnter={() => {
                    if (
                      draggedTodo &&
                      String(cat.id) !== draggedTodo.categoryId
                    ) {
                      setDragOverCategoryId(cat.id);
                    }
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverCategoryId(null);
                    }
                  }}
                  isDragOver={dragOverCategoryId === cat.id}
                />
                {expanded && (
                  <div
                    className={clsx(
                      "self-stretch pl-4 pr-7 flex flex-col justify-start items-start gap-2",
                      dragOverCategoryId === cat.id && "bg-blue-50 rounded-lg p-2",
                    )}
                    onDragEnter={() => {
                      if (draggedTodo && String(cat.id) !== draggedTodo.categoryId) {
                        setDragOverCategoryId(cat.id);
                      }
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setDragOverCategoryId(null);
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (draggedTodo && String(cat.id) !== draggedTodo.categoryId) {
                        setDragOverCategoryId(cat.id);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropOnCategory(e, cat.id);
                    }}
                  >
                    {cat.items.map((w, idx) => (
                      <WorkItem
                        key={w.id ?? `${cat.id}-${idx}`}
                        {...w}
                        currentCategoryId={String(cat.id)}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
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
                        onDoToday={() => {
                          if (w.id) {
                            onUpdateTodo?.({
                              todoId: w.id,
                              categoryId: String(cat.id),
                              title: w.title,
                              date: new Date(),
                              targetSeconds: w.targetSeconds,
                            });
                            const displayTitle =
                              w.title.length > 15
                                ? w.title.slice(0, 15) + "..."
                                : w.title;
                            triggerToast(`${displayTitle}을 오늘로 가져왔습니다.`);
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
        {totalItemsCount === 0 && (
          <div className="flex flex-col items-center justify-center py-50 px-4 text-center">
            <p className="text-gray-600 text-body1-16SB whitespace-pre-wrap">
              오늘 등록된 작업이 없어요!{"\n"}지금 바로 몰입할 작업을 추가해 보세요.
            </p>
          </div>
        )}
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
                  date:
                    editingTodo.date instanceof Date
                      ? editingTodo.date
                      : new Date(editingTodo.date),
                  targetSeconds: editingTodo.targetSeconds,
                }
                : selectedCategoryId
                  ? {
                    categoryId: String(selectedCategoryId),
                  }
                  : undefined
            }
            onSubmit={handleSubmit}
            onCategorySelect={onCategorySelect}
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
