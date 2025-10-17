"use client";

import { useState, Fragment } from "react";
import clsx from "clsx";
import WorkItem, { WorkItemProps } from "./workItem";
import Image from "next/image";

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
            <span className="text-zinc-600 text-sm leading-tight">할 일 추가하기</span>
            <Image src="/icons/plusRed.svg" alt="추가" className="w-6 h-6" width={24} height={24} />
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
  categories,
  onAddWork,
  onToggleCategory,
  className,
}: TodoListProps) {
  const [openMap, setOpenMap] = useState<Record<string | number, boolean>>(
    () => categories.reduce((acc, c) => ((acc[c.id] = c.expanded ?? true), acc), {} as Record<string | number, boolean>),
  );

  const toggle = (id: Category["id"]) => {
    setOpenMap((m) => {
      const next = { ...m, [id]: !m[id] };
      onToggleCategory?.(id, next[id]);
      return next;
    });
  };

  return (
    <div className={clsx("w-[913px] inline-flex flex-col justify-center items-center gap-7", className)}>
      <div className="self-stretch flex flex-col justify-start items-start gap-4">
        {categories.map((cat) => {
          const expanded = openMap[cat.id] ?? true;
          return (
            <Fragment key={cat.id}>
              <CategoryHeader category={cat} expanded={expanded} onToggle={() => toggle(cat.id)} onAdd={() => onAddWork?.(cat.id)} />
              {expanded && (
                <div className="self-stretch pl-4 pr-7 flex flex-col justify-start items-start gap-2">
                  {cat.items.map((w, idx) => (
                    <WorkItem key={`${cat.id}-${idx}`} {...w} className="self-stretch w-[863px]" />
                  ))}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
