"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

function fmtKoreanDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}년 ${mm}월 ${dd}일`;
}

function monthMatrix(base: Date) {
  const y = base.getFullYear();
  const m = base.getMonth();
  const first = new Date(y, m, 1);
  const startIdx = (first.getDay() + 7) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();

  const cells: { date: Date; type: "prev" | "curr" | "next" }[] = [];
  for (let i = startIdx - 1; i >= 0; i--) {
    cells.push({ date: new Date(y, m - 1, prevDays - i), type: "prev" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(y, m, d), type: "curr" });
  }
  const rest = 42 - cells.length;
  for (let d = 1; d <= rest; d++) {
    cells.push({ date: new Date(y, m + 1, d), type: "next" });
  }
  return cells;
}

export default function DateField({
  value,
  onChange,
  className,
}: {
  value: Date;
  onChange?: (d: Date) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(new Date(value));
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => setView(new Date(value)), [value]);

  const cells = useMemo(() => monthMatrix(view), [view]);

  return (
    <div ref={boxRef} className={clsx("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-11 w-full px-4 py-2 bg-gray-100 rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-between items-center"
      >
        <span className="text-sm text-neutral-900 leading-tight">
          {fmtKoreanDate(value)}
        </span>
        <Image
          src="/Icons/calendarGray.svg"
          alt="달력"
          width={24}
          height={24}
          className="w-6 h-6 opacity-70"
        />
      </button>

      {open && (
        <div className="absolute z-50 w-[384px] left-0 mt-2 px-2">
          <div className="w-full p-1 bg-neutral-50 rounded-xl shadow-[0_0_4px_0_rgba(0,0,0,0.10)] outline-1 outline-offset-[-1px] outline-gray-100">
            <div className="h-11 px-8 py-4 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setView((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
                }
                aria-label="이전 달"
              >
                <Image
                  src="/Icons/arrowRight.svg"
                  alt="이전"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </button>
              <div className="flex-1 text-center text-zinc-500 text-base font-semibold leading-snug">
                {view.getFullYear()}년 {view.getMonth() + 1}월
              </div>
              <button
                type="button"
                onClick={() =>
                  setView((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
                }
                aria-label="다음 달"
              >
                <Image
                  src="/Icons/arrowLeft.svg"
                  alt="다음"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </button>
            </div>

            <div className="h-px w-full bg-gray-200" />

            <div className="py-2">
              <div className="grid grid-cols-7 gap-y-1 px-6">
                {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
                  <div
                    key={w}
                    className="h-7 flex items-center justify-center text-zinc-500 text-xs leading-none"
                  >
                    {w}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1 px-6 pb-2">
                {cells.map(({ date, type }) => {
                  const isToday =
                    date.toDateString() === new Date().toDateString();
                  const isSelected =
                    date.toDateString() === value.toDateString();
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => {
                        onChange?.(date);
                        setOpen(false);
                      }}
                      disabled={type !== "curr"}
                      aria-pressed={isSelected}
                      className={clsx(
                        "w-10 h-10 rounded-full mx-auto flex items-center justify-center transition-colors",
                        type !== "curr" && "opacity-40 cursor-not-allowed",
                        isSelected
                          ? "bg-red-500 text-neutral-50 font-semibold"
                          : isToday
                          ? " text-red-500"
                          : "hover:bg-red-100 hover:text-red-500",
                      )}
                    >
                      <span className="text-base leading-snug">
                        {date.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
