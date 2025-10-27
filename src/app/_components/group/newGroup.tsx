"use client";

import clsx from "clsx";
import Image from "next/image";
import { useMemo, useState, useCallback, useRef } from "react";
import { SearchField } from "./searchField";

export type Mate = {
  id: string;
  name: string;
  status: "active" | "inactive";
  teams: string[];
  lastSeen?: string;
  avatar?: string;
};

export function NewGroup({
  mates,
  onChange,
  className,
  active = false,
}: {
  mates: Mate[];
  onChange?: (p: { name: string; image?: string; inviteUrl: string; invitedIds: string[] }) => void;
  className?: string;
  active?: boolean;
}) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [invited, setInvited] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const inviteUrl = "https://mogakjak-link.invite.example.url";

  const fileRef = useRef<HTMLInputElement>(null);

  const invitedIds = useMemo(
    () => Object.keys(invited).filter((k) => invited[k]),
    [invited],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mates;
    return mates.filter((m) => m.name.toLowerCase().includes(q));
  }, [mates, query]);

  const emit = useCallback(() => {
    onChange?.({ name, image, inviteUrl, invitedIds });
  }, [name, image, inviteUrl, invitedIds, onChange]);

  const onPickImage = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImage(url);
    queueMicrotask(emit);
  }, [emit]);

  return (
    <div
      className={clsx(
        "w-full h-[536px] px-5 pt-5 bg-neutral-50 rounded-tr-2xl rounded-bl-2xl rounded-br-2xl",
        "outline-1 outline-offset-[-1px] outline-neutral-300",
        "flex flex-col gap-6 overflow-hidden min-h-0",
        !active && "hidden",
        className,
      )}
      role="tabpanel"
      aria-hidden={!active}
    >
      <div className="px-5 py-2 inline-flex items-center gap-5">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
        {image ? (
          <button
            type="button"
            onClick={onPickImage}
            className="w-20 h-20 rounded-lg outline-1 outline-offset-[-1px] outline-neutral-300 overflow-hidden"
            aria-label="그룹 이미지 변경"
          >
            <Image
              src={image}
              alt={name || "새 그룹 이미지"}
              width={80}
              height={80}
              unoptimized
              className="w-full h-full object-cover"
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={onPickImage}
            className="w-20 h-20 p-5 bg-gray-200 rounded-lg outline-1 outline-offset-[-1px] outline-neutral-300 grid place-items-center"
            aria-label="그룹 이미지 추가"
          >
            <Image src="/Icons/photoPlus.svg" alt="" width={36} height={36} className="object-contain" />
          </button>
        )}

        <div className="w-96 inline-flex flex-col gap-3">
          <div className="text-neutral-900 text-base font-semibold leading-6">그룹 이름</div>
          <div className="relative h-12 px-5 py-3 bg-gray-100 rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 inline-flex items-center gap-2 box-border">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={emit}
              placeholder="그룹 이름을 입력하세요 (예: 코테 준비방)"
              className="w-full bg-transparent outline-none text-neutral-900 placeholder:text-zinc-500"
            />
            {name && (
              <button
                type="button"
                aria-label="입력 지우기"
                onClick={() => {
                  setName("");
                  emit();
                }}
                className="ml-auto w-5 h-5 rounded hover:bg-black/5 grid place-items-center"
              >
                <Image src="/Icons/cancelGray.svg" alt="" width={16} height={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        <div className="w-96 inline-flex items-start gap-4">
          <div className="text-neutral-900 text-base font-semibold leading-6">링크로 메이트 초대하기</div>
          <div className="text-zinc-600 text-sm leading-5">링크를 공유해서 초대할 수 있어요.</div>
        </div>

        <div className="self-stretch px-5 py-3 bg-neutral-50 rounded-[100px] outline-1 outline-offset-[-1px] outline-neutral-300 inline-flex justify-center items-center gap-5 overflow-hidden box-border min-w-0">
          <div className="text-neutral-700 text-base leading-6 truncate"> {inviteUrl}</div>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(inviteUrl);
              } catch {}
            }}
            aria-label="초대 링크 복사"
            className="w-6 h-6 shrink-0 rounded-md hover:bg-black/5 grid place-items-center"
          >
            <Image src="/Icons/copy.svg" alt="" width={16} height={16} />
          </button>
        </div>
      </div>

      <div className="w-full flex-1 flex flex-col gap-4 min-h-0">
        <div className="inline-flex items-start gap-4">
          <div className="text-neutral-900 text-base font-semibold leading-6">목록에서 메이트 초대하기</div>
          <div className="text-zinc-600 text-sm leading-5">기존의 메이트 목록에서 초대할 수 있어요.</div>
        </div>

        <div className="flex flex-col gap-4 min-h-0">
          <div className="box-border min-w-0">
            <SearchField
              value={query}
              onChange={setQuery}
              onSubmit={() => {}}
              placeholder="함께할 메이트의 이름을 검색해보세요."
            />
          </div>

          <div className="w-[600px] flex gap-5 min-h-0">
            <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto pr-1">
              {filtered.map((m) => {
                const checked = !!invited[m.id];
                return (
                  <div
                    key={m.id}
                    className="h-16 px-4 py-2 bg-neutral-50 rounded-[10px] flex items-center justify-between"
                  >
                    <div className="w-80 flex items-center gap-3">
                      <div className="relative w-12 h-12 shrink-0 grid place-items-center">
                        <div className="w-12 h-12 rounded-full outline-1 outline-offset-[-1px] outline-gray-200 bg-white overflow-hidden grid place-items-center">
                          {m.avatar ? (
                            <Image src={m.avatar} alt={m.name} fill className="object-cover rounded-full" />
                          ) : (
                            <Image src="/Icons/profileDefault.svg" alt="" width={24} height={24} className="opacity-60" />
                          )}
                        </div>
                        <div
                          className={clsx(
                            "absolute w-4 h-4 rounded-full border border-white bottom-[2px] right-[2px]",
                            m.status === "active" ? "bg-green-700" : "bg-gray-400",
                          )}
                        />
                      </div>

                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-neutral-900 text-base font-semibold leading-6 shrink-0">{m.name}</div>
                        <div className="h-5 border-l border-neutral-300 mx-1.5" />
                        <div className="flex items-center gap-3 truncate">
                          <div className="text-zinc-500 text-sm leading-5 truncate">{m.teams.join(", ") || "-"}</div>
                          <div className="w-0.5 h-0.5 bg-zinc-500 rounded-full shrink-0" />
                          <div className="text-zinc-500 text-sm leading-5 whitespace-nowrap shrink-0">
                            {m.status === "active" ? "몰입 중" : m.lastSeen ?? "-"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() =>
                        setInvited((prev) => {
                          const next = { ...prev, [m.id]: !checked };
                          queueMicrotask(emit);
                          return next;
                        })
                      }
                      className="w-6 h-6 grid place-items-center"
                    >
                      <Image
                        src={checked ? "/Icons/checkboxSelected.svg" : "/Icons/checkboxDefault.svg"}
                        alt=""
                        width={24}
                        height={24}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="w-2 h-28 relative bg-gray-200 rounded-[20px] overflow-hidden shrink-0">
              <div className="w-2 h-8 left-0 top-0 absolute bg-gray-400 rounded-[20px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
