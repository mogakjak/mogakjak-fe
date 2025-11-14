"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import clsx from "clsx";

export type PomodoroDialHandle = {
  start: () => void;
  pause: () => void;
  reset: (nextMinutes?: number) => void;
  stop: () => void;
  getSeconds: () => number;
};

function roundCoord(v: number, decimals = 6) {
  const factor = 10 ** decimals;
  return Math.round(v * factor) / factor;
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  const x = cx + r * Math.cos(a);
  const y = cy + r * Math.sin(a);
  return { x: roundCoord(x), y: roundCoord(y) };
}

function norm360(d: number) {
  return ((d % 360) + 360) % 360;
}

function sectorPathFromTo(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
) {
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const diffCW = norm360(endDeg - startDeg);
  const largeArc = diffCW > 180 ? 1 : 0;
  const sweepFlag = 1;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${e.x} ${e.y} Z`;
}

const dd = (n: number) => n.toString().padStart(2, "0");

export default forwardRef<
  PomodoroDialHandle,
  {
    minutes?: number;
    className?: string;
    onComplete?: () => void;
  }
>(function PomodoroDial({ minutes = 60, className, onComplete }, ref) {
  const [targetSec, setTargetSec] = useState(Math.max(0, (minutes ?? 0) * 60));
  const [leftSec, setLeftSec] = useState(targetSec);
  const [running, setRunning] = useState(false);
  const endAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const total = Math.max(0, (minutes ?? 0) * 60);
    setTargetSec(total);
    setLeftSec(total);
    setRunning(false);
    endAtRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [minutes]);

  const loop = useCallback(() => {
    const endAt = endAtRef.current;
    if (!endAt) return;
    const now = performance.now();
    const ms = Math.max(0, endAt - now);
    setLeftSec(ms / 1000);
    if (ms <= 0) {
      setRunning(false);
      endAtRef.current = null;
      onComplete?.();
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [onComplete]);

  const start = useCallback(() => {
    if (running || targetSec === 0) return;
    endAtRef.current = performance.now() + leftSec * 1000;
    setRunning(true);
    rafRef.current = requestAnimationFrame(loop);
  }, [running, targetSec, leftSec, loop]);

  const pause = useCallback(() => {
    if (!running) return;
    const endAt = endAtRef.current;
    if (endAt != null) {
      const now = performance.now();
      const ms = Math.max(0, endAt - now);
      setLeftSec(ms / 1000);
    }
    setRunning(false);
    endAtRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [running]);

  const reset = useCallback(
    (nextMinutes?: number) => {
      const total = Math.max(0, (nextMinutes ?? minutes ?? 0) * 60);
      setTargetSec(total);
      setLeftSec(total);
      setRunning(false);
      endAtRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [minutes]
  );

  const stop = useCallback(() => {
    setTargetSec(0);
    setLeftSec(0);
    setRunning(false);
    endAtRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      start,
      pause,
      reset,
      stop,
      getSeconds: () => Math.floor(leftSec),
    }),
    [start, pause, reset, stop, leftSec]
  );
  const remainRatio = useMemo(
    () => (targetSec > 0 ? Math.max(0, Math.min(1, leftSec / targetSec)) : 0),
    [leftSec, targetSec]
  );

  const isUnset = targetSec === 0;
  const mm = isUnset ? 0 : Math.floor(leftSec / 60);
  const ss = isUnset ? 0 : Math.floor(leftSec % 60);

  const dial = 120;
  const cx = dial / 2;
  const cy = dial / 2;
  const rOuter = dial / 2 - 10;
  const rFill = rOuter - 10;
  const all12 = Array.from({ length: 12 }, (_, i) => i * 30);
  const MAX_SECONDS = 60 * 60;
  const minutesRatio = targetSec > 0 ? Math.min(1, targetSec / MAX_SECONDS) : 0;
  const maxSweep = 360 * minutesRatio;
  const liveSweep = maxSweep * remainRatio;
  const EPS = 0.6;
  const liveStart = 0 - EPS;
  const liveEnd = liveSweep + EPS;

  return (
    <section
      className={clsx(
        "w-full h-full rounded-2xl flex items-center justify-start gap-7 pl-8 bg-neutral-50",
        className
      )}
      data-state={isUnset ? "inactive" : running ? "running" : "paused"}
    >
      <div className="w-[104px] h-[104px] relative grid place-items-center">
        <div className="w-[104px] h-[104px]  rounded-full border-3 border-gray-200" />
        <svg
          width={dial}
          height={dial}
          viewBox={`0 0 ${dial} ${dial}`}
          className="absolute"
          shapeRendering="geometricPrecision"
        >
          <path
            d={sectorPathFromTo(cx, cy, rFill, liveStart, liveEnd)}
            fill="#fa5332"
          />
          {all12.map((deg) => {
            if (deg % 90 === 0) return null;
            const len = 9;
            const sw = 2;
            const col = "#E6E8EB";
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
          <Image
            src="/pomodoro.svg"
            width={28}
            height={28}
            alt="Pomodoro Center"
          />
        </div>
      </div>

      <div className=" flex flex-col items-center gap-1">
        <div className="w-full flex items-center gap-2">
          <div className=" flex flex-col gap-2 items-start">
            <div className="inline-flex gap-1">
              <div className="grid place-items-center">
                <span
                  className={clsx(
                    "text-xl font-bold",
                    isUnset ? "text-gray-400" : "text-gray-800"
                  )}
                >
                  {dd(mm)[0]}
                </span>
              </div>
              <div className="grid place-items-center">
                <span
                  className={clsx(
                    "text-xl font-bold",
                    isUnset ? "text-gray-400" : "text-gray-800"
                  )}
                >
                  {dd(mm)[1]}
                </span>
              </div>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <span
              className={clsx(
                "text-xl font-medium",
                isUnset ? "text-gray-400" : "text-gray-800"
              )}
            >
              :
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-2 items-start">
            <div className="inline-flex gap-1">
              <div className="grid place-items-center">
                <span
                  className={clsx(
                    "text-xl font-bold",
                    isUnset ? "text-gray-400" : "text-gray-800"
                  )}
                >
                  {dd(ss)[0]}
                </span>
              </div>
              <div className=" grid place-items-center">
                <span
                  className={clsx(
                    "text-xl font-bold",
                    isUnset ? "text-gray-400" : "text-gray-800"
                  )}
                >
                  {dd(ss)[1]}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 select-none -mt-0.5">
          <div className="flex items-center gap-1">
            <div className="grid place-items-center">
              <span className="text-16 font-semibold text-gray-400">
                {dd(Math.floor(targetSec / 60))[0]}
              </span>
            </div>
            <div className="grid place-items-center">
              <span className="text-16 font-semibold text-gray-400">
                {dd(Math.floor(targetSec / 60))[1]}
              </span>
            </div>
          </div>
          <span className="text-16 font-semibold text-gray-400">:</span>
          <div className="flex items-center gap-1">
            <div className="grid place-items-center">
              <span className="text-16 font-semibold text-gray-400">0</span>
            </div>
            <div className="grid place-items-center">
              <span className="text-16 font-semibold text-gray-400">0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
