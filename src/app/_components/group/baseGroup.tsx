"use client";

import clsx from "clsx";
import Image from "next/image";
import { useMemo, useState } from "react";
import { SearchField } from "./searchField";

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
      <SearchField
  value={query}
  onChange={setQuery}
  onSubmit={() => {}}
  placeholder="그룹을 검색해보세요"
/>

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
