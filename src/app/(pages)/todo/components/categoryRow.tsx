"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Image from "next/image";

type Props = {
  id: string;
  label: string;
  colorToken: string; // e.g. 'bg-category-1-red'
  selected?: boolean;
  onSelect?: () => void;
  showHandle?: boolean;
  editable?: boolean;
  onRename?: (newName: string) => void;
};

export default function CategoryRow({
  label,
  colorToken,
  selected,
  onSelect,
  showHandle,
  editable,
  onRename,
}: Props) {
  const [isEditing, setIsEditing] = useState<boolean>(editable ?? false);
  const [value, setValue] = useState(label);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== label) onRename?.(trimmed);
    else setValue(label);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setValue(label);
      setIsEditing(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1 w-full">
      <button
        type="button"
        onClick={() => !isEditing && onSelect?.()}
        onDoubleClick={() => setIsEditing(true)}
        className={clsx(
          "w-full h-11 rounded-lg inline-flex items-stretch overflow-hidden text-left transition-all outline outline-1",
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
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
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

      <div className="w-6 h-6 flex items-center justify-center">
        {showHandle && (
          <Image
            src="/icons/drag.svg"
            alt="drag handle"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        )}
      </div>
    </div>
  );
}
