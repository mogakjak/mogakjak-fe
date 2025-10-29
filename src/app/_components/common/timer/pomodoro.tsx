"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function elapsedSectorPath(cx: number, cy: number, r: number, elapsedRatio: number) {
  const p = Math.max(0, Math.min(1, elapsedRatio));
  if (p <= 0) return "";
  const sweep = Math.max(360 * p, 0.5);
  const largeArc = sweep > 180 ? 1 : 0;
  const s = polarToCartesian(cx, cy, r, 0);
  const e = polarToCartesian(cx, cy, r, sweep);
  return [`M ${cx} ${cy}`, `L ${s.x} ${s.y}`, `A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`, "Z"].join(" ");
}

const dd = (n: number) => n.toString().padStart(2, "0");

export default function PomodoroDial({
  minutes = 60,
  className,
  onComplete,
}: {
  minutes?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const isUnset = !minutes || minutes <= 0;

  const [targetSec, setTargetSec] = useState(Math.max(0, (minutes ?? 0) * 60));
  const [leftSec, setLeftSec] = useState(targetSec);
  const endAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const total = Math.max(0, (minutes ?? 0) * 60);
    setTargetSec(total);
    setLeftSec(total);

    if (total === 0) {
      endAtRef.current = null; // 비활성일때 
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    endAtRef.current = performance.now() + total * 1000;

    const loop = () => {
      const endAt = endAtRef.current!;
      const now = performance.now();
      const ms = Math.max(0, endAt - now);
      setLeftSec(ms / 1000);
      if (ms <= 0) {
        onComplete?.();
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [minutes, onComplete]);

  const remainRatio = useMemo(
    () => (targetSec > 0 ? Math.max(0, Math.min(1, leftSec / targetSec)) : 0),
    [leftSec, targetSec],
  );
  const elapsedRatio = 1 - remainRatio;

  const mm = isUnset ? 0 : Math.floor(leftSec / 60);
  const ss = isUnset ? 0 : Math.floor(leftSec % 60);

  const dial = 288;
  const cx = dial / 2;
  const cy = dial / 2;
  const rOuter = dial / 2 - 8;
  const rFill = rOuter - 10;
  const all12 = Array.from({ length: 12 }, (_, i) => i * 30);
  const maskProgress = isUnset ? 0 : elapsedRatio;

  return (
    <section
      className={clsx(
        "w-140 h-80 rounded-2xl inline-flex justify-center items-center gap-6 bg-neutral-50",
        className,
      )}
      data-state={isUnset ? "inactive" : "active"}
    >
      <div className="w-72 h-72 relative grid place-items-center">
        <div className="w-72 h-72 bg-gray-100 rounded-full border border-gray-200" />
        <svg width={dial} height={dial} viewBox={`0 0 ${dial} ${dial}`} className="absolute">
          <defs>
            <mask id="cut">
              <rect x="0" y="0" width={dial} height={dial} fill="white" />
              <path d={elapsedSectorPath(cx, cy, rFill, maskProgress)} fill="black" />
            </mask>
          </defs>
          <circle cx={cx} cy={cy} r={rFill} fill="currentColor" className="text-red-500" mask="url(#cut)" />
          {all12.map((deg) => {
            const isCardinal = [0, 90, 180, 270].includes(deg);
            const len = isCardinal ? 25 : 17;
            const sw = 4;
            const col = isCardinal ? "#fa5332" : "#fc9b88";
            const p1 = polarToCartesian(cx, cy, rOuter, deg);
            const p2 = polarToCartesian(cx, cy, rOuter - len, deg);
            return (
              <line
                key={deg}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={col}
                strokeWidth={sw}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        <div className="absolute">
          <Image src="/pomodoro.svg" width={72} height={72} alt="Pomodoro Center" />
        </div>
      </div>

      <div className="w-64 flex flex-col items-center gap-6">
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 flex flex-col gap-1 items-start">
            <div className="text-center w-full text-gray-400 text-body1-16M">MINS</div>
            <div className="inline-flex gap-1">
              <div className={clsx(
                "w-14 h-16 px-4 py-2 bg-gray-100 rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 grid place-items-center",
              )}>
                <span className={clsx("text-3xl font-bold", isUnset ? "text-gray-400" : "text-gray-800")}>
                  {dd(mm)[0]}
                </span>
              </div>
              <div className="w-14 h-16 px-3 py-2 bg-gray-100 rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 grid place-items-center">
                <span className={clsx("text-3xl font-bold", isUnset ? "text-gray-400" : "text-gray-800")}>
                  {dd(mm)[1]}
                </span>
              </div>
            </div>
          </div>
          <div className="w-3 h-24 relative">
            <span className={clsx(
              "absolute left-1/2 -translate-x-1/2 top-[34px] text-3xl font-medium",
              isUnset ? "text-gray-400" : "text-gray-800",
            )}>
              :
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-1 items-start">
            <div className="text-center w-full text-gray-400 text-body1-16M">SECS</div>
            <div className="inline-flex gap-1">
              <div className="w-14 h-16 px-3 py-2 bg-gray-100 rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 grid place-items-center">
                <span className={clsx("text-3xl font-bold", isUnset ? "text-gray-400" : "text-gray-800")}>
                  {dd(ss)[0]}
                </span>
              </div>
              <div className="w-14 h-16 px-3 py-2 bg-gray-100 rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 grid place-items-center">
                <span className={clsx("text-3xl font-bold", isUnset ? "text-gray-400" : "text-gray-800")}>
                  {dd(ss)[1]}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 text-caption-12SB">SET TIMES</div>
        <div className="inline-flex items-center gap-[6px] select-none -mt-2">
          <div className="flex items-center gap-1">
            <div className="w-10 h-12 px-2.5 bg-gray-100 rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 grid place-items-center">
              <span className="text-2xl font-semibold text-gray-400">{dd(Math.floor(targetSec / 60))[0]}</span>
            </div>
            <div className="w-10 h-12 px-2.5 bg-gray-100 rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 grid place-items-center">
              <span className="text-2xl font-semibold text-gray-400">{dd(Math.floor(targetSec / 60))[1]}</span>
            </div>
          </div>
          <span className="text-2xl font-semibold text-gray-400">:</span>
          <div className="flex items-center gap-1">
            <div className="w-10 h-12 px-2.5 bg-gray-100 rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 grid place-items-center">
              <span className="text-2xl font-semibold text-gray-400">0</span>
            </div>
            <div className="w-10 h-12 px-2.5 bg-gray-100 rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 grid place-items-center">
              <span className="text-2xl font-semibold text-gray-400">0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
