"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useCallback
} from "react";
import clsx from "clsx";

export type StopwatchHandle = {
  start: () => void;
  pause: () => void;
  reset: () => void;
  stop: () => void;
  getSeconds: () => number;
};

export type StopwatchProps = {
  className?: string;
  autoStart?: boolean;
  initialSeconds?: number;
  onTick?: (totalSeconds: number) => void;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
};

const dd = (n: number) => n.toString().padStart(2, "0");

export default forwardRef<StopwatchHandle, StopwatchProps>(function Stopwatch(
  {
    className,
    autoStart = false,
    initialSeconds = 0,
    onTick,
    onStart,
    onPause,
    onStop,
  },
  ref
) {
  const rafRef = useRef<number | null>(null);
  const anchorRef = useRef<number | null>(null);
  const baseElapsedRef = useRef<number>(Math.max(0, initialSeconds) * 1000);
  const [elapsedMs, setElapsedMs] = useState<number>(
    Math.max(0, initialSeconds) * 1000
  );
  const [running, setRunning] = useState<boolean>(autoStart);
  const loop = useCallback(() => {
    if (anchorRef.current == null) return;
    const now = performance.now();
    const ms = baseElapsedRef.current + (now - anchorRef.current);
    setElapsedMs(ms);
    onTick?.(Math.floor(ms / 1000));
    rafRef.current = requestAnimationFrame(loop);
  }, [onTick]);
  
  const start = useCallback(() => {
    if (running) return;
    anchorRef.current = performance.now();
    setRunning(true);
    rafRef.current = requestAnimationFrame(loop);
    onStart?.();
  }, [running, loop, onStart]);
  
  const pause = useCallback(() => {
    if (!running) return;
    if (anchorRef.current != null) {
      const now = performance.now();
      baseElapsedRef.current += now - anchorRef.current;
    }
    anchorRef.current = null;
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    onPause?.();
  }, [running, onPause]);
  
  const reset = useCallback(() => {
    baseElapsedRef.current = 0;
    if (anchorRef.current != null) {
      anchorRef.current = performance.now();
    }
    setElapsedMs(0);
    onTick?.(0);
  }, [onTick]);
  
  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    anchorRef.current = null;
    baseElapsedRef.current = 0;
    setElapsedMs(0);
    setRunning(false);
    onStop?.();
  }, [onStop]);
  

  useImperativeHandle(
    ref,
    () => ({
      start,
      pause,
      reset,
      stop,
      getSeconds: () => Math.floor(elapsedMs / 1000),
    }),
    [start, pause, reset, stop, elapsedMs]
  );

  useEffect(() => {
    if (autoStart) start();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalSec = Math.floor(elapsedMs / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const H = dd(Math.min(hrs, 99));
  const M = dd(mins);
  const S = dd(secs);

  const isZero = hrs === 0 && mins === 0 && secs === 0;
  const renderUnit = (label: "HRS" | "MINS" | "SECS", digits: string) => (
    <div className="flex flex-col items-center gap-2">
      <div className="text-center text-gray-400 text-xl font-semibold leading-7">{label}</div>
      <div className="flex items-center gap-2">
        <div className="w-16 h-24 px-6 py-3 bg-gray-100 rounded-xl outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-center">
          <span className={clsx(
            "text-6xl font-semibold leading-[78px]",
            isZero ? "text-neutral-400" : "text-neutral-800"
          )}>{digits[0]}</span>
        </div>
        <div className="w-16 h-24 px-6 py-3 bg-gray-100 rounded-xl outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-center">
          <span className={clsx(
            "text-6xl font-semibold leading-[78px]",
            isZero ? "text-neutral-400" : "text-neutral-800"
          )}>{digits[1]}</span>
        </div>
      </div>
    </div>
  );
  
  const Colon = () => (
    <div className="w-3.5 h-32 flex items-center justify-center">
      <span className={clsx(
        "text-5xl font-bold leading-[67px] pt-7",
        isZero ? "text-neutral-400" : "text-neutral-700"
      )}>:</span>
    </div>
  );
  
  return (
    <section
      className={clsx(
        "w-[560px] h-80 relative bg-neutral-50 rounded-2xl outline-1 outline-offset-[-1px] outline-gray-200",
        className
      )}
    >
      <div className="absolute left-[54px] top-[88px] inline-flex justify-start items-center gap-2">
        {renderUnit("HRS", H)}
        <Colon />
        {renderUnit("MINS", M)}
        <Colon />
        {renderUnit("SECS", S)}
      </div>
    </section>
  );
});  