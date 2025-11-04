"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import Image from "next/image";

type GroupStatus = "active" | "inactive";

export type ForkGroup = {
  id: string;
  name: string;
  members: number;
  capacity: number;
  status: GroupStatus;
  avatarUrl?: string;
};

export default function ForkPopup({
  userName = "박뽀모",
  groups,
  defaultSelectedId,
  onJoin,
  className,
}: {
  userName?: string;
  groups: ForkGroup[];
  defaultSelectedId?: string;
  onJoin?: (groupId: string) => void;
  className?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    defaultSelectedId,
  );

  const selected = useMemo(
    () => groups.find((g) => g.id === selectedId),
    [groups, selectedId],
  );

  const handleSelect = (g: ForkGroup) => setSelectedId(g.id);
  const handleJoin = () => selected && onJoin?.(selected.id);

  return (
    <div
      className={clsx(
        "w-full max-w-[720px] px-8 py-7 bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)]",
        className,
      )}
      role="dialog"
      aria-modal="true"
    >
      <header className="flex flex-col items-center text-center gap-4 pt-13">
          <Image src="/Icons/fork.svg" alt="fork" width={40} height={40} />
        <div className="space-y-1">
          <h2 className="text-neutral-900 text-2xl font-semibold font-['Pretendard']">
            콕! 찌르기
          </h2>
          <p className="text-neutral-500 leading-relaxed font-['Pretendard']">
            <span className="text-rose-500 font-semibold">{userName}</span>
            님을 참여할 방으로 초대하고,
            <br />
            모각작을 시작해 보세요!
          </p>
        </div>
      </header>

      <section className="mt-8 space-y-4">
        <h3 className="text-neutral-900 font-semibold font-['Pretendard']">
          함께 몰입 중인 그룹 ({groups.length}개)
        </h3>

        <ul className="space-y-3 max-h-[184px] overflow-y-auto pr-1">
          {groups.map((g) => {
            const isSelected = selectedId === g.id;
            const isActive = g.status === "active";

            return (
              <li key={g.id}>
                <div
                  data-selected={isSelected}
                  className={clsx(
                    "px-5 py-3 rounded-lg inline-flex items-center gap-5 w-full",
                    "bg-gray-100 cursor-pointer transition-colors",
                    "hover:bg-rose-50",
                    isSelected &&
                      "bg-rose-50 outline-1 outline-offset-[-1px] outline-red-500",
                  )}
                  onClick={() => handleSelect(g)}
                >
                  <div className="w-14 h-14 bg-neutral-50 rounded-lg border border-gray-200" />
                  <div className="flex justify-start items-center gap-2 flex-1">
                    <div className="w-40 h-5 relative">
                      <div className="w-40 left-0 top-0 absolute text-neutral-900 text-base font-medium font-['Pretendard'] leading-6">
                        {g.name}
                      </div>
                    </div>
                    <div className="inline-flex flex-col justify-center items-center gap-2.5">
                      <div className="text-right text-zinc-500 text-base font-medium font-['Pretendard'] leading-6">
                        {g.members}/{g.capacity}명
                      </div>
                    </div>
                  </div>

                  {isActive ? (
                    <div className="h-9 px-6 py-2 bg-red-500 rounded-2xl flex justify-center items-center">
                      <div className="text-neutral-50 text-sm font-semibold leading-5">
                        몰입 중
                      </div>
                    </div>
                  ) : (
                    <div className="h-9 px-6 py-2 bg-gray-200 rounded-2xl flex justify-center items-center">
                      <div className="text-gray-400 text-sm font-semibold leading-5">
                        휴식 중
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="mt-8 grid place-items-center">
        {selected ? (
          <button
            type="button"
            onClick={handleJoin}
            className="h-12 px-6 py-3 bg-red-500 rounded-2xl inline-flex justify-center items-center gap-2 w-full max-w-[380px]"
          >
            <span className="text-neutral-50 text-base font-semibold leading-6">
              나도 모각작 참여하기
            </span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="h-12 px-6 py-3 bg-gray-200 rounded-2xl inline-flex justify-center items-center gap-2 w-full max-w-[380px]"
          >
            <span className="text-gray-400 text-base font-semibold leading-6">
              나도 모각작 참여하기
            </span>
          </button>
        )}
      </footer>
    </div>
  );
}
