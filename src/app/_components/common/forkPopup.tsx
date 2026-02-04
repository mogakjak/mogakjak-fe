"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import type { CommonGroup } from "@/app/_types/groups";

type GroupStatus = "active" | "inactive";

export type ForkGroup = {
  id: string;
  name: string;
  members: number;
  capacity: number;
  status: GroupStatus;
  avatarUrl?: string;
};

// CommonGroup을 ForkGroup으로 변환
function convertToForkGroup(group: CommonGroup): ForkGroup {
  const isActive =
    group.myParticipationStatus === "PARTICIPATING" ||
    group.targetParticipationStatus === "PARTICIPATING";
  
  return {
    id: group.groupId,
    name: group.groupName,
    members: group.memberCount,
    capacity: group.maxMemberCount,
    status: isActive ? "active" : "inactive",
    avatarUrl: group.imageUrl,
  };
}

export default function ForkPopup({
  userName = "박뽀모",
  groups,
  defaultSelectedId,
  onJoin,
  className,
  onClose,
}: {
  userName?: string;
  groups: ForkGroup[] | CommonGroup[];
  defaultSelectedId?: string;
  onJoin?: (groupId: string) => void;
  className?: string;
  onClose?: () => void;
}) {
  // CommonGroup 배열인 경우 ForkGroup으로 변환
  const forkGroups: ForkGroup[] = useMemo(() => {
    if (groups.length === 0) return [];
    // 첫 번째 그룹이 CommonGroup인지 확인
    const firstGroup = groups[0];
    if ("groupId" in firstGroup) {
      return (groups as CommonGroup[])
        .filter((group) => group.targetParticipationStatus !== "PARTICIPATING")
        .map(convertToForkGroup);
    }
    return groups as ForkGroup[];
  }, [groups]);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    defaultSelectedId
  );

  const selected = useMemo(
    () => forkGroups.find((g) => g.id === selectedId),
    [forkGroups, selectedId],
  );

  const handleSelect = (g: ForkGroup) => setSelectedId(g.id);
  const handleJoin = () => {
    if (selected) {
      onJoin?.(selected.id);
      onClose?.();
    }
  };

  return (
    <div
      className={clsx(
        "w-full max-w-[720px] px-8 py-7 bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)]",
        className
      )}
      role="dialog"
      aria-modal="true"
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="닫기"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      <header className="flex flex-col items-center text-center gap-4 pt-13 relative">
        <Image src="/Icons/fork.svg" alt="fork" width={40} height={40} />
        <div className="space-y-1">
          <h2 className="text-neutral-900 text-2xl font-semibold font-['Pretendard']">
            콕! 찌르기
          </h2>
          <p className="text-neutral-500 leading-relaxed font-['Pretendard']">
            <span className="text-red-400 font-semibold">{userName}</span>
            님을 참여할 방으로 초대하고,
            <br />
            모각작을 시작해 보세요!
          </p>
        </div>
      </header>

      <section className="mt-8 space-y-4">
        <h3 className="text-neutral-900 font-semibold font-['Pretendard']">
          함께 몰입 중인 그룹 ({forkGroups.length}개)
        </h3>

        <ul className="space-y-3 max-h-[184px] overflow-y-auto pr-1">
          {forkGroups.length === 0 ? (
            <li className="text-center text-gray-500 py-4">
              함께 있는 그룹이 없습니다.
            </li>
          ) : (
            forkGroups.map((g) => {
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
                      "bg-rose-50 outline-1 -outline-offset-1 outline-red-500"
                  )}
                  onClick={() => handleSelect(g)}
                >
                  <div className="relative w-14 h-14 bg-neutral-50 rounded-lg border border-gray-500 overflow-hidden">
                    {g.avatarUrl ? (
                      <Image
                        src={g.avatarUrl}
                        alt={g.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-50" />
                    )}
                  </div>
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
            })
          )}
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
              모각작 시작하기
            </span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="h-12 px-6 py-3 bg-gray-200 rounded-2xl inline-flex justify-center items-center gap-2 w-full max-w-[380px]"
          >
            <span className="text-gray-400 text-base font-semibold leading-6">
              모각작 시작하기
            </span>
          </button>
        )}
      </footer>
    </div>
  );
}
