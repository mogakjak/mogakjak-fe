"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useCallback,
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
  {
    className,
    hours = 0,
    minutes = 0,
    seconds = 0,
    autoStart = false,
    onComplete,
    onTick,
  },
  ref
) {
  const initialMs = Math.max(0, (hours * 3600 + minutes * 60 + seconds) * 1000);
  const [targetMs, setTargetMs] = useState(initialMs);
  const [leftMs, setLeftMs] = useState(initialMs);
  const [running, setRunning] = useState(autoStart);
  const rafRef = useRef<number | null>(null);
  const endAtRef = useRef<number | null>(null);

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
    // eslint-disable-next-line
  }, [hours, minutes, seconds, autoStart]);

  const loop = useCallback(() => {
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
  }, [onTick, onComplete]);

  const start = useCallback(() => {
    if (running || targetMs <= 0) return;
    endAtRef.current = performance.now() + leftMs;
    setRunning(true);
    rafRef.current = requestAnimationFrame(loop);
  }, [running, targetMs, leftMs, loop]);

  const pause = useCallback(() => {
    if (!running) return;
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    endAtRef.current = null;
  }, [running]);

  const reset = useCallback(() => {
    setLeftMs(targetMs);
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    endAtRef.current = null;
  }, [targetMs]);

  const stop = useCallback(() => {
    setRunning(false);
    setLeftMs(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    endAtRef.current = null;
  }, []);

  const setTime = useCallback((h: number, m: number, s: number) => {
    const ms = Math.max(0, (h * 3600 + m * 60 + s) * 1000);
    setTargetMs(ms);
    setLeftMs(ms);
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    endAtRef.current = null;
  }, []);

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
    [start, pause, reset, stop, setTime, leftMs]
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
    <div className="  grid place-items-center">
      <span
        className={clsx(
          "text-3xl font-bold tabular-nums",
          inactive ? "text-neutral-400" : "text-neutral-800"
        )}
      >
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
    <div className="inline-flex flex-col items-center gap-1">
      <span className="text-gray-400 text-caption-12SB">{label}</span>
      <div className="inline-flex items-center bg-gray-100 py-1 px-3 gap-1 rounded-lg">
        <Digit char={value[0]} inactive={inactive} />
        <Digit char={value[1]} inactive={inactive} />
      </div>
    </div>
  );

  const Colon = ({ inactive }: { inactive: boolean }) => (
    <div className="h-12 grid place-items-center">
      <div
        className={clsx(
          "flex flex-col items-center gap-1 translate-y-5",
          inactive ? "opacity-40" : "opacity-80"
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
      </div>
    </div>
  );

  return (
    <section
      className={clsx(
        "w-full bg-neutral-50 inline-flex items-center justify-center",
        className
      )}
    >
      <div className="w-full max-w-[820px] px-4">
        <div className="w-fit mx-auto">
          <div className="flex items-start justify-center gap-3">
            <Unit label="HRS" value={H} inactive={isZeroInitial} />
            <Colon inactive={isZeroInitial} />
            <Unit label="MINS" value={M} inactive={isZeroInitial} />
            <Colon inactive={isZeroInitial} />
            <Unit label="SECS" value={S} inactive={isZeroInitial} />
          </div>

          <div className="mt-3 relative h-6 bg-gray-100 rounded-lg outline-1 outline-gray-200 overflow-hidden w-full">
            <div
              className="absolute inset-[2px] rounded-md origin-left transition-transform duration-150 ease-linear"
              style={{
                transform: `scaleX(${progress})`,
                backgroundColor: "#ff5a3d",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
});
