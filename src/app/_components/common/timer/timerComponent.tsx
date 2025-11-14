"use client";

import { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import TimerSelected from "./timerSelected";
import TimerButtons from "./timerButton";
import PomodoroDial, { PomodoroDialHandle } from "./pomodoro";
import Stopwatch, { StopwatchHandle } from "./stopwatch";
import Countdown, { CountdownHandle } from "./timer";

type Mode = "pomodoro" | "stopwatch" | "timer";

const CONTENT_FIXED = "h-[140px]";

export default function TimerComponent({
  className,
  initialMode = "pomodoro",
}: {
  className?: string;
  initialMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [running, setRunning] = useState(false);

  const pomoRef = useRef<PomodoroDialHandle>(null);
  const swRef = useRef<StopwatchHandle>(null);
  const cdRef = useRef<CountdownHandle>(null);

  const onStart = () => {
    if (mode === "pomodoro") pomoRef.current?.start();
    if (mode === "stopwatch") swRef.current?.start();
    if (mode === "timer") cdRef.current?.start();
    setRunning(true);
  };

  const onPause = () => {
    if (mode === "pomodoro") pomoRef.current?.pause();
    if (mode === "stopwatch") swRef.current?.pause();
    if (mode === "timer") cdRef.current?.pause();
    setRunning(false);
  };

  const onStop = () => {
    if (mode === "pomodoro") {
      pomoRef.current?.reset();
    } else if (mode === "stopwatch") {
      swRef.current?.stop();
    } else {
      cdRef.current?.reset();
    }
    setRunning(false);
  };

  const onSwitch = (m: Mode) => {
    onStop();
    setMode(m);
  };

  const body = useMemo(() => {
    if (mode === "pomodoro") {
      return (
        <div className="w-full h-full grid place-items-center">
          <PomodoroDial
            ref={pomoRef}
            minutes={2}
            className="shrink-0"
            onComplete={() => setRunning(false)}
          />
        </div>
      );
    }
    if (mode === "stopwatch") {
      return (
        <div className="w-full h-full grid place-items-center">
          <Stopwatch ref={swRef} className="w-full h-full" />
        </div>
      );
    }
    return (
      <div className="w-full h-full grid place-items-center">
        <Countdown
          ref={cdRef}
          className="w-full h-full"
          hours={0}
          minutes={3}
          seconds={0}
          autoStart={false}
          onComplete={() => setRunning(false)}
        />
      </div>
    );
  }, [mode]);

  return (
    <section className={clsx("w-full mx-auto space-y-4 mt-5", className)}>
      <div className="mx-auto">
        <TimerSelected value={mode} onChange={onSwitch} />
      </div>
      <div
        className={clsx(
          "mx-auto  bg-neutral-50 overflow-hidden flex items-center justify-center",
          CONTENT_FIXED
        )}
      >
        <div className="w-full h-full flex items-center justify-center">
          {body}
        </div>
      </div>
      <div className="mx-auto">
        <TimerButtons
          mode={mode}
          running={running}
          onStart={onStart}
          onPause={onPause}
          onStop={onStop}
          className="w-full"
        />
      </div>
    </section>
  );
}
