"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  TIMER_MODE_LABELS,
  type TimerMode,
} from "@/app/_utils/defaultTimerMode";

const MODE_OPTIONS: TimerMode[] = ["pomodoro", "stopwatch", "timer"];

export default function DefaultTimerModeSelect({
  value,
  onChange,
  disabled = false,
  className,
}: {
  value: TimerMode;
  onChange: (mode: TimerMode) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={boxRef} className={clsx("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="self-stretch w-full inline-flex justify-end items-center gap-2 disabled:opacity-50"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="기본 타이머 설정"
      >
        <Image
          src="/Icons/setting.svg"
          alt=""
          width={24}
          height={24}
          className="w-6 h-6"
          aria-hidden
        />
        <span className="text-zinc-600 text-sm font-semibold leading-5">
          기본 타이머 설정
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="기본 타이머 종류"
          className="absolute right-0 top-full mt-1 z-50 w-60 p-2 bg-neutral-50 rounded-lg shadow-[0px_0px_28px_0px_rgba(0,0,0,0.15)] flex flex-col gap-1"
        >
          {MODE_OPTIONS.map((mode) => {
            const selected = mode === value;
            return (
              <button
                key={mode}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(mode);
                  setOpen(false);
                }}
                className="self-stretch px-4 py-2 bg-neutral-50 rounded-lg inline-flex justify-start items-center gap-2 overflow-hidden hover:bg-gray-100 transition-colors"
              >
                <span
                  className={clsx(
                    "text-sm leading-5",
                    selected
                      ? "text-red-500 font-semibold"
                      : "text-neutral-700 font-normal",
                  )}
                >
                  {TIMER_MODE_LABELS[mode]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
