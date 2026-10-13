"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { CategoryColorToken } from "@/app/_types/category";

export type CategoryOption = {
  id: string;
  name: string;
  colorToken: CategoryColorToken;
};

export default function CategorySelect({
  value,
  options,
  placeholder = "카테고리를 선택하세요.",
  onChange,
  onCreate,
  disabled = false,
  className,
}: {
  value?: string | null;
  options: CategoryOption[];
  placeholder?: string;
  onChange?: (id: string) => void;
  /** 전달 시 드롭다운 하단에 '새 카테고리 추가' 입력이 노출됨 */
  onCreate?: (name: string) => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // 외부 클릭 시 닫기 로직 (useEffect 사용)
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const selected = options.find((o) => o.id === value);

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed || !onCreate || isCreating) return;
    setIsCreating(true);
    try {
      await onCreate(trimmed);
      setNewName("");
      setOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div ref={boxRef} className={clsx("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="self-stretch h-11 w-full px-4 py-2 bg-gray-100 rounded-lg outline-1 outline-gray-200 inline-flex justify-between items-center transition-all disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="inline-flex items-center gap-2">

          <span
            className={clsx(
              "text-sm leading-tight",
              selected ? "text-neutral-900" : "text-zinc-500",
            )}
          >
            {selected ? selected.name : placeholder}
          </span>
        </div>
        <Image
          src={open ? "/Icons/arrowUpGray.svg" : "/Icons/arrowDownGray.svg"}
          alt="열기"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-2">
          <div className="w-full p-2 bg-neutral-50 rounded-[10px] shadow-[0_0_10px_0_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col gap-1">
            <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
              {options.map((o) => {
                const active = o.id === value;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      onChange?.(o.id);
                      setOpen(false);
                    }}
                    className={clsx(
                      "h-10 w-full px-3 py-2 rounded-lg inline-flex items-center gap-2 transition-colors",
                      active ? "bg-red-50" : "bg-neutral-50 hover:bg-gray-100",
                    )}
                  >
                    <span
                      className={clsx(
                        "w-4 h-4 rounded shrink-0",
                        o.colorToken === "category-1-red" && "bg-category-1-red",
                        o.colorToken === "category-2-orange" &&
                        "bg-category-2-orange",
                        o.colorToken === "category-3-yellow" &&
                        "bg-category-3-yellow",
                        o.colorToken === "category-4-green" &&
                        "bg-category-4-green",
                        o.colorToken === "category-5-skyblue" &&
                        "bg-category-5-skyblue",
                        o.colorToken === "category-6-blue" &&
                        "bg-category-6-blue",
                        o.colorToken === "category-7-purple" &&
                        "bg-category-7-purple",
                      )}
                    />
                    <span className={clsx(
                      "text-sm leading-tight truncate",
                      active ? "font-semibold text-neutral-900" : "text-neutral-700"
                    )}>
                      {o.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {onCreate && (
              <div className="h-10 flex items-center gap-2 border border-gray-200 rounded-lg px-3">
                <Image
                  src="/Icons/plusFilled.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <input
                  type="text"
                  value={newName}
                  maxLength={20}
                  disabled={isCreating}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      void handleCreate();
                    }
                  }}
                  placeholder="새 카테고리 추가"
                  className="w-full bg-transparent outline-none text-body2-14R placeholder:text-gray-400"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
