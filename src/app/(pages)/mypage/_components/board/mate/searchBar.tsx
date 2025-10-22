"use client";

import Image from "next/image";
import { FormEvent } from "react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: (v: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "메이트를 검색해보세요",
}: SearchBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-[419px] h-12 px-5 py-3 rounded-lg bg-gray-100 border border-gray-200 
                  flex items-center gap-3`}
      role="search"
      aria-label="메이트 검색"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-body1-16R text-gray-700
                   placeholder:text-gray-400"
      />

      <button
        type="submit"
        aria-label="검색"
        className="shrink-0 p-1 rounded-full transition-all duration-150
                   hover:opacity-80 focus:outline-none"
      >
        <Image
          src="/Icons/search.svg"
          alt=""
          width={20}
          height={20}
          className="opacity-60"
        />
      </button>
    </form>
  );
}
