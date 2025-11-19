"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import TimerSelected from "./timerSelected";
import TimerButtons from "./timerButton";
import PomodoroDial, { PomodoroDialHandle } from "./pomodoro";
import Stopwatch, { StopwatchHandle } from "./stopwatch";
import Countdown, { CountdownHandle } from "./timer";
import PomodoroModal from "./pomodoroModal";
import TimerEndModal from "../timerEndModal";
import {
  useStartPomodoro,
  usePauseTimer,
  useResumeTimer,
  useFinishTimer,
} from "@/app/_hooks/timers";
import { useTimer } from "@/app/_contexts/TimerContext";
import { usePictureInPicture } from "@/app/_hooks/usePictureInPicture";

type Mode = "pomodoro" | "stopwatch" | "timer";

const CONTENT_FIXED = "h-[110px]";

export default function TimerComponent({
  className,
  initialMode = "pomodoro",
  todoId,
}: {
  className?: string;
  initialMode?: Mode;
  todoId?: string | null;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [running, setRunning] = useState<boolean>(false);
  const [pomodoroModalOpen, setPomodoroModalOpen] = useState(false);
  const [timerEndModalOpen, setTimerEndModalOpen] = useState(false);
  const [pomodoroConfig, setPomodoroConfig] = useState<{
    focusSeconds: number;
    breakSeconds: number;
    repeatCount: number;
  } | null>(null);
  const [currentPhase, setCurrentPhase] = useState<"FOCUS" | "BREAK">("FOCUS");
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  const { setIsRunning } = useTimer();
  const startPomodoroMutation = useStartPomodoro();
  const pauseTimerMutation = usePauseTimer();
  const resumeTimerMutation = useResumeTimer();
  const finishTimerMutation = useFinishTimer();

  const pomoRef = useRef<PomodoroDialHandle>(null);
  const swRef = useRef<StopwatchHandle>(null);
  const cdRef = useRef<CountdownHandle>(null);
  const timerContainerRef = useRef<HTMLElement>(null);
  const openPipWindowRef = useRef<(() => Promise<boolean>) | null>(null);
  const isInPipRef = useRef<boolean>(false);

  const handlePomodoroStart = useCallback(async (
    focusSeconds: number,
    breakSeconds: number,
    repeatCount: number
  ) => {
    if (!todoId) {
      console.error("todoId가 없어 뽀모도로를 시작할 수 없습니다.");
      return;
    }

    setPomodoroConfig({ focusSeconds, breakSeconds, repeatCount });
    setCurrentPhase("FOCUS");
    setCurrentRound(1);
    setIsPaused(false);
    
    try {
      const session = await startPomodoroMutation.mutateAsync({
        todoId,
        focusSeconds,
        breakSeconds,
        repeatCount,
      });
      setSessionId(session.sessionId);
      pomoRef.current?.reset(focusSeconds / 60);
      pomoRef.current?.start();
      setRunning(true);
      setIsPaused(false);
      setIsRunning(true);
      if (timerContainerRef.current && openPipWindowRef.current) {
        openPipWindowRef.current();
      }
    } catch (error) {
      console.error("뽀모도로 시작 실패:", error);
      setPomodoroConfig(null);
      setSessionId(null);
      setIsPaused(false);
      setRunning(false);
      setIsRunning(false);
    }
  }, [todoId, startPomodoroMutation, setIsRunning]);

  const onStart = useCallback(async () => {
    console.log('onStart called:', { mode, isPaused, sessionId, running });
    if (mode === "pomodoro") {
      if (isPaused && sessionId) {
        console.log('Resuming pomodoro with sessionId:', sessionId);
        try {
          await resumeTimerMutation.mutateAsync(sessionId);
          pomoRef.current?.start();
          setRunning(true);
          setIsPaused(false);
          setIsRunning(true);
          if (timerContainerRef.current && openPipWindowRef.current && !isInPipRef.current) {
            openPipWindowRef.current();
          }
        } catch (error) {
          console.error("타이머 재개 실패:", error);
        }
      } else {
        setPomodoroModalOpen(true);
      }
    } else {
    if (mode === "stopwatch") swRef.current?.start();
    if (mode === "timer") cdRef.current?.start();
      setRunning(true);
      setIsRunning(true);
      
      // Stopwatch/Timer도 사용자 제스처 컨텍스트에서 바로 PIP 열기
      if (timerContainerRef.current && openPipWindowRef.current) {
        openPipWindowRef.current();
      }
    }
  }, [mode, isPaused, sessionId, running, resumeTimerMutation, setIsRunning, pomoRef, swRef, cdRef, timerContainerRef, openPipWindowRef, isInPipRef]);

  const onPause = useCallback(async () => {
    if (mode === "pomodoro") {
      if (!sessionId) {
        console.error("sessionId가 없어 타이머를 정지할 수 없습니다.");
        return;
      }
      try {
        await pauseTimerMutation.mutateAsync(sessionId);
        pomoRef.current?.pause();
        setRunning(false);
        setIsPaused(true);
        setIsRunning(false);
      } catch (error) {
        console.error("타이머 정지 실패:", error);
      }
    } else {
    if (mode === "stopwatch") swRef.current?.pause();
    if (mode === "timer") cdRef.current?.pause();
    setRunning(false);
      setIsRunning(false);
    }
  }, [mode, sessionId, pauseTimerMutation, setIsRunning]);

  const onStop = useCallback(async () => {
    if (mode === "pomodoro") {
      if (!sessionId) {
        console.error("sessionId가 없어 타이머를 종료할 수 없습니다.");
        return;
      }
      try {
        await finishTimerMutation.mutateAsync(sessionId);
      pomoRef.current?.reset();
        setPomodoroConfig(null);
        setCurrentPhase("FOCUS");
        setCurrentRound(1);
        setSessionId(null);
        setIsPaused(false);
        setRunning(false);
        setIsRunning(false);
      } catch (error) {
        console.error("타이머 종료 실패:", error);
      }
    } else if (mode === "stopwatch") {
      swRef.current?.stop();
      setRunning(false);
      setIsRunning(false);
    } else {
      cdRef.current?.reset();
      setRunning(false);
      setIsRunning(false);
    }
  }, [mode, sessionId, finishTimerMutation, setIsRunning]);

  const { isInPip, openPipWindow, closePipWindow } = usePictureInPicture({
    containerRef: timerContainerRef,
    isRunning: running,
  });

  openPipWindowRef.current = openPipWindow;
  isInPipRef.current = isInPip;

  const handlePipToggle = useCallback(() => {
    if (isInPip) {
      closePipWindow();
    } else {
      openPipWindow();
    }
  }, [isInPip, openPipWindow, closePipWindow]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (running && !isInPip) {
        e.preventDefault();
        e.returnValue = "";
        setTimerEndModalOpen(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [running, isInPip]);

  const handlePomodoroComplete = useCallback(() => {
    if (!pomodoroConfig) return;
    if (currentPhase === "FOCUS") {
      if (currentRound <= pomodoroConfig.repeatCount) {
        setCurrentPhase("BREAK");
        setRunning(true);
        setIsRunning(true);
      } else {
        setRunning(false);
        setPomodoroConfig(null);
        setCurrentPhase("FOCUS");
        setCurrentRound(1);
        setIsRunning(false);
      }
    } else {
      setCurrentPhase("FOCUS");
      setCurrentRound((prev) => prev + 1);
      setRunning(true);
      setIsRunning(true);
    }
  }, [pomodoroConfig, currentPhase, currentRound, setIsRunning]);
  const phaseChangeRef = useRef<string | null>(null);
  useEffect(() => {
    if (mode === "pomodoro" && running && pomodoroConfig && pomoRef.current) {
      const phaseKey = `${currentPhase}-${currentRound}`;
      if (phaseChangeRef.current !== phaseKey && phaseChangeRef.current !== null) {
        const timer = setTimeout(() => {
          if (pomoRef.current && pomodoroConfig) {
            const minutes = currentPhase === "FOCUS"
              ? pomodoroConfig.focusSeconds / 60
              : pomodoroConfig.breakSeconds / 60;
            pomoRef.current.reset(minutes);
            pomoRef.current.start();
          }
        }, 100);
        phaseChangeRef.current = phaseKey;
        return () => clearTimeout(timer);
      } else if (phaseChangeRef.current === null) {
        phaseChangeRef.current = phaseKey;
      }
    }
  }, [mode, running, currentPhase, currentRound, pomodoroConfig]);

  const onSwitch = (m: Mode) => {
    onStop();
    setMode(m);
  };

  const body = useMemo(() => {
    if (mode === "pomodoro") {
      const minutes = pomodoroConfig
        ? currentPhase === "FOCUS"
          ? pomodoroConfig.focusSeconds / 60
          : pomodoroConfig.breakSeconds / 60
        : 0;
      const key = pomodoroConfig
        ? `pomodoro-${currentPhase}-${currentRound}-${pomodoroConfig.focusSeconds}-${pomodoroConfig.breakSeconds}`
        : "pomodoro-default";
      return (
        <div className="w-full h-full grid place-items-center">
          <PomodoroDial
            key={key}
            ref={pomoRef}
            minutes={minutes}
            className="shrink-0"
            onComplete={handlePomodoroComplete}
            isBreak={currentPhase === "BREAK"}
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
  }, [mode, pomodoroConfig, currentPhase, currentRound, handlePomodoroComplete]);

  const handleTimerEndModalClose = useCallback(() => {
    setTimerEndModalOpen(false);
  }, []);

  return (
    <>
      <div data-timer-container-parent>
        <section 
          ref={(el) => {
            if (el) {
              (timerContainerRef as React.MutableRefObject<HTMLElement | null>).current = el;
            }
          }}
          className={clsx("w-full mx-auto space-y-4 mt-5", className)}
        >
      {!isInPip && (
        <div className="mx-auto">
          <TimerSelected value={mode} onChange={onSwitch} />
        </div>
      )}

      <div
        className={clsx(
          "mx-auto overflow-hidden flex items-center justify-center",
          CONTENT_FIXED
        )}
      >
        <div className="w-full h-full flex items-center justify-center">
          {body}
        </div>
      </div>

      {!isInPip && (
      <div className="mx-auto">
        <TimerButtons
          running={running}
          onStart={onStart}
          onPause={onPause}
          onStop={onStop}
          onPipToggle={running ? handlePipToggle : undefined}
          isInPip={isInPip}
          currentPhase={mode === "pomodoro" ? currentPhase : "FOCUS"}
          className="w-full"
        />
      </div>
      )}
    </section>
      </div>

      {!isInPip && (
        <>
          <PomodoroModal
            open={pomodoroModalOpen}
            onClose={() => setPomodoroModalOpen(false)}
            onStart={handlePomodoroStart}
          />

          {timerEndModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <TimerEndModal onClose={handleTimerEndModalClose} />
            </div>
          )}
        </>
      )}
    </>
  );
}
