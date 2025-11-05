"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import ForkPopup, { ForkGroup } from "@/app/_components/common/forkPopup";
import { SearchField } from "@/app/_components/group/searchField";
import { Button } from "@/components/button";
import Image from "next/image";

export type Friend = {
  id: string;
  name: string;
  teams: string[];
  active: boolean;
  lastText?: string;
  avatarUrl?: string;
};

export default function FriendList({
  title = "친구들의 집중 현황",
  groupLabel = "그룹이름가나다라",
  friends,
  groupsForPoke,
  className,
}: {
  title?: string;
  groupLabel?: string;
  friends: Friend[];
  groupsForPoke: ForkGroup[];
  className?: string;
}) {
  const [q, setQ] = useState("");
  const [openPoke, setOpenPoke] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const filtered = useMemo(() => {
    const keyword = q.trim();
    if (!keyword) return friends;
    return friends.filter(
      (f) =>
        f.name.includes(keyword) ||
        f.teams.join(", ").includes(keyword) ||
        f.lastText?.includes(keyword),
    );
  }, [friends, q]);

  const openForkPopup = (f: Friend) => {
    if (!f.active) return;
    setSelectedFriend(f);
    setOpenPoke(true);
  };

  return (
    <>
      <section
        className={clsx(
          "w-full max-w-[960px] mx-auto h-[388px]", 
          "bg-neutral-50 rounded-[20px] px-10 pt-9 flex flex-col overflow-hidden",
          className,
        )}
        aria-label={title}
      >
        <div className="flex-shrink-0 flex flex-col gap-6 pb-4">
          <h2 className="text-neutral-900 text-xl font-semibold leading-7">
            {title}
          </h2>

          <div className="flex items-start justify-between gap-6">
            <div className="w-96 py-2 flex items-center gap-2">
              <span className="text-zinc-500 text-base font-semibold leading-6">
                {groupLabel}
              </span>
              <Image
                src={"/Icons/arrowDownGray.svg"}
                alt=">"
                width={16}
                height={16}
              />
            </div>

            <div className="w-96">
              <SearchField
                value={q}
                onChange={setQ}
                placeholder="메이트를 검색해보세요"
              />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2">
          <ul className="flex flex-col">
            {filtered.map((f, idx) => {
              const rightText = f.active ? "몰입 중" : f.lastText ?? "n일 전";
              const canPoke = f.active;

              return (
                <li key={f.id}>
                  <div className="px-5 py-4 flex w-full items-center justify-between">
                    <div className="flex items-center gap-7">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gray-100 rounded-[40px] outline-1 outline-offset-[-1px] outline-gray-200 overflow-hidden" />
                        <div
                          className={clsx(
                            "w-5 h-5 absolute left-[40px] top-[40px] rounded-full border border-neutral-50",
                            canPoke ? "bg-green-800" : "bg-gray-400",
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-neutral-900 text-xl font-semibold leading-7">
                          {f.name}
                        </div>
                        <div className="w-6 h-px rotate-90 bg-black/80" />
                        <div className="flex items-center gap-3">
                          <div className="text-zinc-500 text-base leading-6">
                            {f.teams.join(", ")}
                          </div>
                          <div className="w-0.5 h-0.5 bg-zinc-500 rounded-full" />
                          <div className="text-zinc-500 text-base leading-6">
                            {rightText}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => openForkPopup(f)}
                      disabled={!canPoke}
                      variant={canPoke ? "primary" : "muted"}
                      leftIconSrc={
                        canPoke
                          ? "Icons/forkActive.svg"
                          : "Icons/forkInactive.svg"
                      }
                      aria-label="포크로 찌르기"
                      className="rounded-2xl"
                    >
                      포크로 찌르기
                    </Button>
                  </div>
                  {idx !== filtered.length - 1 && (
                    <div className="h-px bg-gray-200" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      {openPoke && selectedFriend && (
        <div
          className="fixed inset-0 z-50 bg-black/30 grid place-items-center p-4"
          onClick={() => setOpenPoke(false)}
        >
          <div
            className="max-w-[720px] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <ForkPopup
              userName={selectedFriend.name}
              groups={groupsForPoke}
              onJoin={() => setOpenPoke(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
