"use client";

import clsx from "clsx";
import Image from "next/image";
import { useCallback, useId, useState } from "react";

type SearchFieldProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange?: (v: string) => void;
  onSubmit?: (v: string) => void;
};

export function SearchField({
  value,
  defaultValue,
  placeholder = "그룹을 검색해보세요",
  className,
  disabled,
  autoFocus,
  onChange,
  onSubmit,
}: SearchFieldProps) {
  const labelId = useId();
  const isControlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue ?? "");
  const v = isControlled ? (value as string) : inner;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      if (!isControlled) setInner(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      onSubmit?.(v ?? "");
    },
    [onSubmit, v],
  );
  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        "h-12 px-5 py-3 bg-gray-100 rounded-lg",
        "outline-1 outline-offset-[-1px] outline-gray-200",
        "inline-flex items-center gap-3 w-full",
        className,
      )}
      role="search"
      aria-labelledby={labelId}
    >
      <span id={labelId} className="sr-only">검색</span>

      <input
        type="search"
        inputMode="search"
        value={v}
        onChange={handleChange}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={clsx(
          "flex-1 bg-transparent outline-none appearance-none",
          "text-neutral-900 placeholder:text-zinc-500 text-base leading-6",
        )}
        aria-label={placeholder}
      />
      <button
        type="submit"
        aria-label="검색"
        disabled={disabled}
        className="w-6 h-6 relative shrink-0 rounded-md hover:bg-black/5 disabled:opacity-50"
      >
        <Image src="/Icons/search.svg" alt="" width={20} height={20} />
      </button>
    </form>
  );
}
