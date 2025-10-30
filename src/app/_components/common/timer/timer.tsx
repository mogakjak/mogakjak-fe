"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";

export type CountdownHandle = {
  start: () => void;
  pause: () => void;
  reset: () => void;
  stop: () => void;
  setTime: (h: number, m: number, s: number) => void;
  getLeftSeconds: () => number;
};

export type CountdownProps = {
  className?: string;
  hours?: number;
  minutes?: number;
  seconds?: number;
  autoStart?: boolean;
  onComplete?: () => void;
  onTick?: (leftSeconds: number) => void;
};

const dd = (n: number) => n.toString().padStart(2, "0");

export default forwardRef<CountdownHandle, CountdownProps>(function Countdown(
  { className, hours = 0, minutes = 0, seconds = 0, autoStart = false, onComplete, onTick },
  ref
) {
  const initialMs = Math.max(0, (hours * 3600 + minutes * 60 + seconds) * 1000);
  const [targetMs, setTargetMs] = useState(initialMs);
  const [leftMs, setLeftMs] = useState(initialMs);
  const [running, setRunning] = useState(autoStart);
  const rafRef = useRef<number | null>(null);
  const endAtRef = useRef<number | null>(null);

  const digitsWrapRef = useRef<HTMLDivElement>(null);
  const [digitsWidth, setDigitsWidth] = useState<number>(0);

  useEffect(() => {
    const el = digitsWrapRef.current;
    if (!el) return;
    const w0 = Math.round(el.getBoundingClientRect().width);
    setDigitsWidth(w0);
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      setDigitsWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setTargetMs(initialMs);
    setLeftMs(initialMs);
    setRunning(autoStart);
    endAtRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (autoStart && initialMs > 0) {
      endAtRef.current = performance.now() + initialMs;
      rafRef.current = requestAnimationFrame(loop);
    }
  }, [hours, minutes, seconds, autoStart]);

  const loop = () => {
    const endAt = endAtRef.current;
    if (endAt == null) return;
    const now = performance.now();
    const ms = Math.max(0, endAt - now);
    setLeftMs(ms);
    onTick?.(Math.floor(ms / 1000));
    if (ms <= 0) {
      setRunning(false);
      endAtRef.current = null;
      onComplete?.();
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  };

  const start = () => {
    if (running || targetMs <= 0) return;
    endAtRef.current = performance.now() + leftMs;
    setRunning(true);
    rafRef.current = requestAnimationFrame(loop);
  };

  const pause = () => {
    if (!running) return;
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    endAtRef.current = null;
  };

  const reset = () => {
    setLeftMs(targetMs);
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    endAtRef.current = null;
  };

  const stop = () => {
    setRunning(false);
    setLeftMs(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    endAtRef.current = null;
  };

  const setTime = (h: number, m: number, s: number) => {
    const ms = Math.max(0, (h * 3600 + m * 60 + s) * 1000);
    setTargetMs(ms);
    setLeftMs(ms);
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    endAtRef.current = null;
  };

  useImperativeHandle(
    ref,
    () => ({
      start,
      pause,
      reset,
      stop,
      setTime,
      getLeftSeconds: () => Math.floor(leftMs / 1000),
    }),
    [leftMs, targetMs, running]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const leftSec = Math.floor(leftMs / 1000);
  const hrs = Math.floor(leftSec / 3600);
  const mins = Math.floor((leftSec % 3600) / 60);
  const secs = leftSec % 60;

  const H = dd(Math.min(hrs, 99));
  const M = dd(mins);
  const S = dd(secs);

  const isZeroInitial = targetMs === 0;
  const progress = useMemo(
    () => (targetMs > 0 ? Math.max(0, Math.min(1, leftMs / targetMs)) : 0),
    [leftMs, targetMs]
  );

  const Digit = ({ char, inactive }: { char: string; inactive: boolean }) => (
    <div className="w-28 h-32 rounded-2xl bg-gray-100 outline-1 outline-gray-200 outline-offset-[-1px] grid place-items-center">
      <span className={clsx("text-6xl font-bold tabular-nums", inactive ? "text-neutral-400" : "text-neutral-800")}>
        {char}
      </span>
    </div>
  );

  const Unit = ({
    label,
    value,
    inactive,
  }: {
    label: "HRS" | "MINS" | "SECS";
    value: string;
    inactive: boolean;
  }) => (
    <div className="inline-flex flex-col items-center gap-3 min-w-[13rem]">
      <span className="text-gray-400 text-xl font-semibold leading-7">{label}</span>
      <div className="inline-flex items-center gap-3">
        <Digit char={value[0]} inactive={inactive} />
        <Digit char={value[1]} inactive={inactive} />
      </div>
    </div>
  );

  const Colon = ({ inactive }: { inactive: boolean }) => (
    <div className="w-10 h-32 grid place-items-center">
      <div className={clsx("flex flex-col items-center gap-2 translate-y-9", inactive ? "opacity-40" : "opacity-80")}>
        <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
        <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
      </div>
    </div>
  );

  return (
    <section
      className={clsx(
        "w-[560px] h-80 px-10 py-8 bg-neutral-50  inline-flex flex-col items-center gap-6",
        className
      )}
    >
      <div className="w-full grid place-items-center">
        <div ref={digitsWrapRef} className="inline-flex items-start justify-center gap-4">
          <Unit label="HRS" value={H} inactive={isZeroInitial} />
          <Colon inactive={isZeroInitial} />
          <Unit label="MINS" value={M} inactive={isZeroInitial} />
          <Colon inactive={isZeroInitial} />
          <Unit label="SECS" value={S} inactive={isZeroInitial} />
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-3">
        <div
          className="relative h-12 bg-gray-100 rounded-lg outline-1 outline-gray-200 outline-offset-[-1px] overflow-hidden mx-auto transition-opacity"
          style={{ width: digitsWidth ? `${digitsWidth}px` : undefined, opacity: digitsWidth ? 1 : 0 }}
        >
          <div
            className="absolute inset-[3px] rounded-md origin-left transition-transform duration-150 ease-linear"
            style={{ transform: `scaleX(${progress})`, backgroundColor: "#ff5a3d" }}
          />
        </div>

        <div
          className="inline-flex justify-center items-center gap-8 mx-auto transition-opacity"
          style={{ width: digitsWidth ? `${digitsWidth}px` : undefined, opacity: digitsWidth ? 1 : 0 }}
        >
          <span className="text-gray-400 text-xl font-semibold leading-7">SET TIME</span>
          <span className="text-gray-400 text-xl font-semibold leading-7 tabular-nums">
            {dd(Math.floor(targetMs / 3600000))} : {dd(Math.floor((targetMs % 3600000) / 60000))} : {dd(Math.floor((targetMs % 60000) / 1000))}
          </span>
        </div>
      </div>
    </section>
  );
});
