"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import Image from "next/image";

type Props = {
  id: string;
  index: number;
  label: string;
  colorToken: string;
  selected?: boolean;
  showHandle?: boolean;
  editable?: boolean;
  onSelect?: () => void;
  onRename?: (newName: string) => void;
  onDelete?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onReorder?: (fromId: string, toId: string) => void;
};

export default function CategoryRow({
  id,
  label,
  colorToken,
  selected,
  showHandle,
  editable,
  onSelect,
  onRename,
  onDelete,
  onMoveUp,
  onMoveDown,
  onReorder,
}: Props) {
  const [isEditing, setIsEditing] = useState<boolean>(editable ?? false);
  const [value, setValue] = useState(label);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const commitEdit = () => {
    setIsEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== label) onRename?.(trimmed);
    else setValue(label);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setValue(label);
      setIsEditing(false);
    }
  };

  const calcMenuPos = () => {
    const el = handleRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuPos({
      left: Math.round(r.right + 8),
      top: Math.round(r.top + r.height / 2),
    });
  };

  useEffect(() => {
    if (!menuOpen) return;
    calcMenuPos();
    const closeOnOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current || !handleRef.current) return;
      if (!menuRef.current.contains(t) && !handleRef.current.contains(t)) setMenuOpen(false);
    };
    const onScroll = () => calcMenuPos();
    const onResize = () => calcMenuPos();
    document.addEventListener("mousedown", closeOnOutside);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  const dragId = `cat-${id}`;

  return (
    <div
      className={clsx("relative inline-flex items-center gap-1 w-full", showHandle && "drag-target")}
      draggable={!!showHandle}
      onDragStart={(e) => {
        if (!showHandle) return;
        e.dataTransfer.setData("text/plain", dragId);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        if (!showHandle) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        if (!showHandle) return;
        e.preventDefault();
        const from = e.dataTransfer.getData("text/plain");
        if (from && from !== dragId) onReorder?.(from.replace("cat-", ""), id);
      }}
    >
      <button
        type="button"
        onClick={() => !isEditing && onSelect?.()}
        onDoubleClick={() => setIsEditing(true)}
        className={clsx(
          "w-full h-11 rounded-lg inline-flex items-stretch overflow-hidden text-left transition-all outline-1",
          selected ? "outline-red-500" : "outline-gray-200",
        )}
      >
        <div className={clsx("w-3 h-full", colorToken)} />
        <div className="flex-1 bg-gray-100 px-4 py-2.5 inline-flex items-center">
          {isEditing ? (
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={onKey}
              className="w-full bg-transparent outline-none text-neutral-900 font-medium text-base"
            />
          ) : (
            <span
              className={clsx(
                "text-base leading-snug truncate cursor-text",
                selected ? "text-neutral-900 font-semibold" : "text-neutral-700",
              )}
            >
              {value}
            </span>
          )}
        </div>
      </button>

      <div className="relative w-6 h-6 flex items-center justify-center">
        {showHandle && (
          <>
            <button
              ref={handleRef}
              type="button"
              aria-label="정렬/더보기"
              className="w-6 h-6 grid place-items-center"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Image src="/icons/drag.svg" alt="drag handle" width={24} height={24} className="w-6 h-6" />
            </button>

            {menuOpen &&
              typeof document !== "undefined" &&
              createPortal(
                <div
                  ref={menuRef}
                  className="fixed z-50 -translate-y-1/2 w-60 p-2 bg-neutral-50 rounded-lg shadow-[0_0_28px_0_rgba(0,0,0,0.15)] inline-flex flex-col gap-1"
                  style={{ left: menuPos.left, top: menuPos.top }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onMoveUp?.(id);
                      setMenuOpen(false);
                    }}
                    className="self-stretch px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-gray-100"
                  >
                    <Image src="/icons/categoryUp.svg" alt="위로" width={24} height={24} className="w-6 h-6" />
                    <span className="text-neutral-700 text-sm leading-tight">위로 옮기기</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onDelete?.(id);
                      setMenuOpen(false);
                    }}
                    className="self-stretch px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-gray-100"
                  >
                    <Image src="/icons/delete.svg" alt="삭제" width={24} height={24} className="w-6 h-6" />
                    <span className="text-neutral-700 text-sm leading-tight">삭제하기</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onMoveDown?.(id);
                      setMenuOpen(false);
                    }}
                    className="self-stretch px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-gray-100"
                  >
                    <Image src="/icons/categoryDown.svg" alt="아래로" width={24} height={24} className="w-6 h-6" />
                    <span className="text-neutral-700 text-sm leading-tight">아래로 옮기기</span>
                  </button>
                </div>,
                document.body,
              )}
          </>
        )}
      </div>
    </div>
  );
}
