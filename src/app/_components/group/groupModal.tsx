"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { BaseGroup, Group } from "./baseGroup";
import { Mate, NewGroup } from "./newGroup";

export type Tab = "find" | "create";

export default function GroupModal({
  open,
  onClose,
  onNext,
  findTabGroups = [],
  mates = [],
  initialTab = "find",
  className,
}: {
  open: boolean;
  onClose?: () => void;
  onNext?: (
    payload:
      | { kind: "select"; groupId: string }
      | { kind: "create"; name: string; image?: string; inviteUrl: string; invitedIds: string[] }
  ) => void;
  findTabGroups?: Group[];
  mates?: Mate[];
  initialTab?: Tab;
  className?: string;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createPayload, setCreatePayload] = useState<{
    name: string;
    image?: string;
    inviteUrl: string;
    invitedIds: string[];
  } | null>(null);

  const nextEnabled = useMemo(() => {
    if (tab === "find") return !!selectedId;
    return !!createPayload?.name && !!createPayload?.invitedIds.length;
  }, [tab, selectedId, createPayload]);

  if (!open) return null;

  return (
    <div className={clsx("fixed inset-0 z-[1000]", className)}>
      <button className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="닫기 오버레이" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] max-w-[calc(100vw-32px)]">
        <div className="bg-neutral-50 rounded-[20px] shadow-[0_0_28px_rgba(0,0,0,.15)] p-5 flex flex-col max-h-[calc(100vh-32px)] overflow-hidden">
          <div className="flex justify-end">
            <button type="button" onClick={onClose} aria-label="닫기">
              <Image src="/Icons/cancel.svg" alt="닫기" width={24} height={24} />
            </button>
          </div>

          <div className="px-5 pb-5 flex flex-col gap-6 min-h-0 flex-1">
            <h2 className="text-neutral-900 text-xl font-semibold text-center">
              {tab === "find" ? "함께 몰입할 그룹을 선택해주세요!" : "함께 몰입할 그룹을 생성해주세요!"}
            </h2>

            <div className="w-full flex flex-col">
              <div role="tablist" className="flex border-b border-neutral-200">
                <button
                  role="tab"
                  onClick={() => setTab("find")}
                  aria-selected={tab === "find"}
                  className={clsx(
                    "h-10 px-6 text-sm font-semibold rounded-t-[10px] -mb-[1px] transition-colors w-fit",
                    tab === "find" ? "bg-red-400 text-white" : "bg-neutral-300 text-white"
                  )}
                >
                  기존 그룹 찾기
                </button>
                <button
                  role="tab"
                  onClick={() => setTab("create")}
                  aria-selected={tab === "create"}
                  className={clsx(
                    "h-10 px-6 text-sm font-semibold rounded-t-[10px] -mb-[1px] transition-colors w-fit",
                    tab === "create" ? "bg-red-400 text-white" : "bg-neutral-300 text-white"
                  )}
                >
                  새 그룹 만들기
                </button>
              </div>

              <div className="rounded-tr-2xl rounded-b-2xl outline-1 outline-neutral-300 overflow-hidden flex-1 min-h-0 border-t-0">
                <div className="w-full h-full overflow-y-auto">
                  {tab === "find" ? (
                    <BaseGroup
                      active
                      groups={findTabGroups}
                      selectedId={selectedId ?? undefined}
                      onSelect={setSelectedId}
                    />
                  ) : (
                    <NewGroup active mates={mates} onChange={(p) => setCreatePayload(p)} />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                disabled={!nextEnabled}
                onClick={() => {
                  if (!nextEnabled) return;
                  if (tab === "find" && selectedId) onNext?.({ kind: "select", groupId: selectedId });
                  if (tab === "create" && createPayload) onNext?.({ kind: "create", ...createPayload });
                }}
                className={clsx(
                  "w-48 h-12 px-6 rounded-2xl inline-flex justify-center items-center",
                  nextEnabled ? "bg-red-500 text-neutral-50" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                다음 단계로
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
