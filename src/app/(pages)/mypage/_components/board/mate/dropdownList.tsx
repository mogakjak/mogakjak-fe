"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface DropdownListProps {
  items: string[];
  defaultLabel?: string;
  defaultHighlightIndex?: number;
  onChange?: (value: string) => void;
}

export default function DropdownList({
  items,
  defaultLabel = "전체 그룹",
  defaultHighlightIndex = 1,
  onChange,
}: DropdownListProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(defaultLabel);
  const [highlight, setHighlight] = useState(defaultHighlightIndex);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const itemEl = panelRef.current.querySelector<HTMLButtonElement>(
      `[data-idx="${highlight}"]`
    );
    itemEl?.scrollIntoView({ block: "nearest" });
  }, [open, highlight]);

  const handleSelect = (value: string) => {
    setLabel(value);
    setOpen(false);
    onChange?.(value);
  };

  return (
    <div className="relative inline-block z-50">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 text-body1-16SB transition-colors duration-150 ${
          label !== defaultLabel ? "text-red-400" : "text-gray-500"
        }`}
      >
        {label}
        <Image
          src={open ? "/Icons/arrowUp.svg" : "/Icons/arrowDown.svg"}
          alt="화살표"
          width={24}
          height={24}
          className="transition-transform duration-200 opacity-40"
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="listbox"
          className="absolute mt-3 w-[340px] rounded-2xl border border-gray-200 bg-white shadow-md p-2
                     max-h-[190px] overflow-y-auto
                     [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2
                     [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          <ul>
            {items.map((item, idx) => {
              const isSelected = item === label;
              return (
                <li key={`${item}-${idx}`}>
                  <button
                    type="button"
                    data-idx={idx}
                    onMouseEnter={() => setHighlight(idx)}
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left text-body2-14R px-4 py-2 rounded-lg transition-colors
                      ${
                        isSelected
                          ? "text-red-600"
                          : highlight === idx
                          ? "text-black"
                          : "text-gray-700"
                      }
                      hover:bg-gray-100`}
                  >
                    {item}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
