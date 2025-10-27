"use client";

import clsx from "clsx";
import Image from "next/image";
import { useMemo, useState, useCallback } from "react";

export type Group = {
  id: string;
  name: string;
  members: number;
  capacity: number;
  status: "active" | "rest";
  avatar?: string;
  memberAvatars?: string[];
};

type BaseGroupProps = {
  groups: Group[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
  active?: boolean;
  showNextButton?: boolean;
  onNextClick?: (id: string) => void;
};

export function BaseGroup({
  groups,
  selectedId,
  onSelect,
  className,
  active = false,
}: BaseGroupProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, query]);
  const onSubmitSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className={clsx(
        "W-full h-[536px] px-5 pt-5 rounded-tr-2xl rounded-b-2xl outline-1 outline-neutral-300",
        "bg-neutral-50 flex flex-col gap-6 overflow-hidden",
        !active && "hidden",
        className,
      )}
      role="tabpanel"
      aria-hidden={!active}
    >
      <form
        onSubmit={onSubmitSearch}
        className={clsx(
          "h-12 px-5 py-3 bg-gray-100 rounded-lg",
          "outline-1 outline-offset-[-1px] outline-gray-200",
          "inline-flex items-center gap-3 w-full",
        )}
        role="search"
      >
        <input
          type="search"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="그룹을 검색해보세요"
          className={clsx(
            "flex-1 bg-transparent outline-none appearance-none",
            "text-neutral-900 placeholder:text-zinc-500 text-base leading-6",
          )}
          aria-label="그룹 검색"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="검색어 지우기"
            className="w-6 h-6 grid place-items-center rounded-full hover:bg-black/5"
          >
            <span aria-hidden className="block w-3.5 h-3.5 relative">
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-[2px] bg-zinc-500 rotate-45 rounded" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-[2px] bg-zinc-500 -rotate-45 rounded" />
            </span>
          </button>
        )}
        <button
          type="submit"
          aria-label="검색"
          className="w-6 h-6 relative shrink-0 rounded-md hover:bg-black/5"
        >
          <span className="absolute inset-0 grid place-items-center">
            <Image src="/Icons/search.svg" alt="" width={16} height={16} />
          </span>
        </button>
      </form>

      <div className="flex-1 w-full flex gap-5">
        <div className="flex-1 h-96 flex flex-col gap-2 overflow-y-auto pr-1 custom-scroll">
          {filtered.map((g) => {
            const isSelected = g.id === selectedId;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelect?.(g.id)}
                className={clsx(
                  "h-20 px-4 py-3 rounded-[10px] inline-flex items-center justify-between",
                  "bg-neutral-50",
                  isSelected
                    ? "outline-2 outline-offset-[-2px] outline-red-400"
                    : "hover:bg-gray-50 outline-0",
                )}
              >
                <div className="flex items-center gap-5">
                  {g.avatar ? (
                    <Image
                      src={g.avatar}
                      alt=""
                      className="w-14 h-14 rounded-lg border border-gray-200 object-cover"
                      width={56}
                      height={56}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg border border-gray-200 bg-white" />
                  )}
                  <div className="flex flex-col items-start gap-2">
                    <div className="text-neutral-900 text-base font-semibold leading-6 line-clamp-1">
                      {g.name}
                    </div>
                    <StatusPill status={g.status} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <AvatarStack avatars={g.memberAvatars} count={g.members} />
                  <div className="text-right text-zinc-700 text-base leading-6">
                    {g.members}/{g.capacity} 명
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="w-2 h-96 relative bg-gray-200 rounded-[20px] overflow-hidden">
          <div className="w-2 h-20 left-0 top-0 absolute bg-gray-400 rounded-[20px]" />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Group["status"] }) {
  const isActive = status === "active";
  return (
    <span
      className={clsx(
        "px-5 py-1 rounded-full text-xs font-semibold leading-4",
        isActive ? "bg-rose-200 text-red-500" : "bg-gray-200 text-zinc-500",
      )}
    >
      {isActive ? "몰입 중" : "휴식 중"}
    </span>
  );
}

function AvatarStack({
  avatars,
  count,
}: {
  avatars?: string[];
  count: number;
}) {
  const visible = Math.min(count, 5);
  const rest = Math.max(0, count - visible);

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {Array.from({ length: visible }).map((_, i) => {
          const src = avatars?.[i];
          return src ? (
            <Image
              key={i}
              src={src}
              alt=""
              width={28}
              height={28}
              className="w-7 h-7 rounded-full border border-gray-200 object-cover"
            />
          ) : (
            <div
              key={i}
              className="w-7 h-7 rounded-full border border-gray-200 bg-gray-300"
            />
          );
        })}
      </div>
      {rest > 0 && (
        <div className="w-7 h-7 p-1 bg-gray-400 rounded-full flex justify-center items-center">
          <span className="text-neutral-50 text-xs">+{rest}</span>
        </div>
      )}
    </div>
  );
}
