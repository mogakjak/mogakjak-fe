"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import TimerSelected from "./timerSelected";
import TimerButtons from "./timerButton";
import PomodoroDial, { PomodoroDialHandle } from "./pomodoro";
import Stopwatch, { StopwatchHandle } from "./stopwatch";
import Countdown, { CountdownHandle } from "./timer";
import PomodoroModal from "./pomodoroModal";
import TimerModal from "./timerModal";
import TimerEndModal from "../timerEndModal";
import TodoRequiredModal from "./todoRequiredModal";
import {
  useStartPomodoro,
  usePauseTimer,
  useResumeTimer,
  useFinishTimer,
  useStartTimer,
  useStartStopwatch,
} from "@/app/_hooks/timers";
import { useTimer } from "@/app/_contexts/TimerContext";
import { usePictureInPicture } from "@/app/_hooks/usePictureInPicture";

type Mode = "pomodoro" | "stopwatch" | "timer";

const CONTENT_FIXED = "h-[110px]";

export default function TimerComponent({
  className,
  initialMode = "pomodoro",
  todoId,
  groupId,
  isTaskPublic,
  isTimerPublic,
  onSessionIdChange,
}: {
  className?: string;
  initialMode?: Mode;
  todoId?: string | null;
  groupId?: string;
  isTaskPublic?: boolean;
  isTimerPublic?: boolean;
  onSessionIdChange?: (sessionId: string | null) => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [running, setRunning] = useState<boolean>(false);
  const [pomodoroModalOpen, setPomodoroModalOpen] = useState(false);
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [timerEndModalOpen, setTimerEndModalOpen] = useState(false);
  const [todoRequiredModalOpen, setTodoRequiredModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);
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
  const startTimerMutation = useStartTimer();
  const startStopwatchMutation = useStartStopwatch();

  const pomoRef = useRef<PomodoroDialHandle>(null);
  const swRef = useRef<StopwatchHandle>(null);
  const cdRef = useRef<CountdownHandle>(null);
  const timerContainerRef = useRef<HTMLElement>(null);
  const openPipWindowRef = useRef<(() => Promise<boolean>) | null>(null);
  const isInPipRef = useRef<boolean>(false);

  const handlePomodoroStart = useCallback(
    async (focusSeconds: number, breakSeconds: number, repeatCount: number) => {
      setPomodoroConfig({ focusSeconds, breakSeconds, repeatCount });
      setCurrentPhase("FOCUS");
      setCurrentRound(1);
      setIsPaused(false);

      if (!todoId) {
        setTodoRequiredModalOpen(true);
        return;
      }

      try {
        const session = await startPomodoroMutation.mutateAsync({
          todoId,
          focusSeconds,
          breakSeconds,
          repeatCount,
          participationType: groupId ? "GROUP" : "INDIVIDUAL",
          ...(groupId && { groupId }),
          isTaskPublic,
          isTimerPublic,
        });
        setSessionId(session.sessionId);
        onSessionIdChange?.(session.sessionId);
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
    },
    [todoId, groupId, startPomodoroMutation, setIsRunning, isTaskPublic, isTimerPublic, onSessionIdChange]
  );

  const onStart = useCallback(async () => {
    if (!todoId) {
      setTodoRequiredModalOpen(true);
      return;
    }

    if (mode === "pomodoro") {
      if (isPaused && sessionId) {
        try {
          await resumeTimerMutation.mutateAsync(sessionId);
          pomoRef.current?.start();
          setRunning(true);
          setIsPaused(false);
          setIsRunning(true);
          if (
            timerContainerRef.current &&
            openPipWindowRef.current &&
            !isInPipRef.current
          ) {
            openPipWindowRef.current();
          }
        } catch (error) {
          console.error("타이머 재개 실패:", error);
        }
      } else {
        setPomodoroModalOpen(true);
      }
    } else if (mode === "stopwatch") {
      if (isPaused && sessionId) {
        // 재개
        try {
          await resumeTimerMutation.mutateAsync(sessionId);
          swRef.current?.start();
          setRunning(true);
          setIsPaused(false);
          setIsRunning(true);
          if (
            timerContainerRef.current &&
            openPipWindowRef.current &&
            !isInPipRef.current
          ) {
            openPipWindowRef.current();
          }
        } catch (error) {
          console.error("스톱워치 재개 실패:", error);
        }
      } else {
        // 새로 시작
        try {
          const session = await startStopwatchMutation.mutateAsync({
            todoId,
            participationType: groupId ? "GROUP" : "INDIVIDUAL",
            ...(groupId && { groupId }),
            isTaskPublic,
            isTimerPublic,
          });
          setSessionId(session.sessionId);
          onSessionIdChange?.(session.sessionId);
          swRef.current?.start();
          setRunning(true);
          setIsPaused(false);
          setIsRunning(true);
          if (timerContainerRef.current && openPipWindowRef.current) {
            openPipWindowRef.current();
          }
        } catch (error) {
          console.error("스톱워치 시작 실패:", error);
        }
      }
    } else if (mode === "timer") {
      if (isPaused && sessionId) {
        // 재개
        try {
          await resumeTimerMutation.mutateAsync(sessionId);
          cdRef.current?.start();
          setRunning(true);
          setIsPaused(false);
          setIsRunning(true);
          if (
            timerContainerRef.current &&
            openPipWindowRef.current &&
            !isInPipRef.current
          ) {
            openPipWindowRef.current();
          }
        } catch (error) {
          console.error("타이머 재개 실패:", error);
        }
      } else {
        // 새로 시작 (모달 열기)
        setTimerModalOpen(true);
      }
    }
  }, [
    mode,
    isPaused,
    sessionId,
    resumeTimerMutation,
    startStopwatchMutation,
    todoId,
    groupId,
    setIsRunning,
    pomoRef,
    swRef,
    cdRef,
    timerContainerRef,
    openPipWindowRef,
    isInPipRef,
    onSessionIdChange,
    isTaskPublic,
    isTimerPublic,
  ]);

  const onPause = useCallback(async () => {
    if (mode === "pomodoro") {
      if (sessionId) {
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
        // sessionId가 없으면 그냥 로컬만 정지
        pomoRef.current?.pause();
        setRunning(false);
        setIsPaused(true);
        setIsRunning(false);
      }
    } else if (mode === "stopwatch") {
      if (sessionId) {
        try {
          await pauseTimerMutation.mutateAsync(sessionId);
          swRef.current?.pause();
          setRunning(false);
          setIsPaused(true);
          setIsRunning(false);
        } catch (error) {
          console.error("스톱워치 정지 실패:", error);
        }
      } else {
        // sessionId가 없으면 그냥 로컬만 정지
        swRef.current?.pause();
        setRunning(false);
        setIsPaused(true);
        setIsRunning(false);
      }
    } else if (mode === "timer") {
      if (sessionId) {
        try {
          await pauseTimerMutation.mutateAsync(sessionId);
          cdRef.current?.pause();
          setRunning(false);
          setIsPaused(true);
          setIsRunning(false);
        } catch (error) {
          console.error("타이머 정지 실패:", error);
        }
      } else {
        // sessionId가 없으면 그냥 로컬만 정지
        cdRef.current?.pause();
        setRunning(false);
        setIsPaused(true);
        setIsRunning(false);
      }
    }
  }, [mode, sessionId, pauseTimerMutation, setIsRunning]);

  const onStop = useCallback(async () => {
    if (mode === "pomodoro") {
      if (sessionId) {
        // sessionId가 있으면 API 호출
        try {
          await finishTimerMutation.mutateAsync(sessionId);
          pomoRef.current?.stop();
          setPomodoroConfig(null);
          setCurrentPhase("FOCUS");
          setCurrentRound(1);
          setSessionId(null);
          onSessionIdChange?.(null);
          setIsPaused(false);
          setRunning(false);
          setIsRunning(false);
        } catch (error) {
          console.error("타이머 종료 실패:", error);
        }
      } else {
        // sessionId가 없으면 그냥 상태만 초기화
        pomoRef.current?.stop();
        setPomodoroConfig(null);
        setCurrentPhase("FOCUS");
        setCurrentRound(1);
        setIsPaused(false);
        setRunning(false);
        setIsRunning(false);
      }
    } else if (mode === "stopwatch") {
      if (sessionId) {
        // sessionId가 있으면 API 호출
        try {
          await finishTimerMutation.mutateAsync(sessionId);
          swRef.current?.stop();
          setSessionId(null);
          onSessionIdChange?.(null);
          setIsPaused(false);
          setRunning(false);
          setIsRunning(false);
        } catch (error) {
          console.error("스톱워치 종료 실패:", error);
        }
      } else {
        // sessionId가 없으면 그냥 상태만 초기화
        swRef.current?.stop();
        setIsPaused(false);
        setRunning(false);
        setIsRunning(false);
      }
    } else if (mode === "timer") {
      if (sessionId) {
        // sessionId가 있으면 API 호출
        try {
          await finishTimerMutation.mutateAsync(sessionId);
          cdRef.current?.reset();
          setSessionId(null);
          onSessionIdChange?.(null);
          setIsPaused(false);
          setRunning(false);
          setIsRunning(false);
        } catch (error) {
          console.error("타이머 종료 실패:", error);
        }
      } else {
        // sessionId가 없으면 그냥 상태만 초기화
        cdRef.current?.reset();
        setIsPaused(false);
        setRunning(false);
        setIsRunning(false);
      }
    }
  }, [mode, sessionId, finishTimerMutation, setIsRunning, onSessionIdChange]);

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
        // 모든 라운드가 끝났을 때
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
      if (
        phaseChangeRef.current !== phaseKey &&
        phaseChangeRef.current !== null
      ) {
        const timer = setTimeout(() => {
          if (pomoRef.current && pomodoroConfig) {
            const minutes =
              currentPhase === "FOCUS"
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
    if (sessionId) {
      setTimerEndModalOpen(true);
      setPendingMode(m);
    } else {
      onStop();
      setMode(m);
    }
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
          minutes={0}
          seconds={0}
          autoStart={false}
          onComplete={() => {
            setRunning(false);
            setIsRunning(false);
          }}
        />
      </div>
    );
  }, [
    mode,
    pomodoroConfig,
    currentPhase,
    currentRound,
    handlePomodoroComplete,
    setIsRunning,
  ]);

  const handleTimerEndModalClose = useCallback(() => {
    setTimerEndModalOpen(false);
    setPendingMode(null);
  }, []);

  const handleTimerEndModalConfirm = useCallback(async () => {
    setTimerEndModalOpen(false);
    if (pendingMode) {
      await onStop();
      setMode(pendingMode);
      setPendingMode(null);
    }
  }, [pendingMode, onStop]);

  return (
    <>
      <div data-timer-container-parent>
        <section
          ref={(el) => {
            if (el) {
              (
                timerContainerRef as React.MutableRefObject<HTMLElement | null>
              ).current = el;
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
                onPipToggle={handlePipToggle}
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
          <TimerModal
            isOpen={timerModalOpen}
            onClose={() => setTimerModalOpen(false)}
            onStart={async (targetSeconds: number) => {
              if (!todoId) {
                setTimerModalOpen(false);
                setTodoRequiredModalOpen(true);
                return;
              }
              try {
                const session = await startTimerMutation.mutateAsync({
                  todoId,
                  targetSeconds,
                  participationType: groupId ? "GROUP" : "INDIVIDUAL",
                  ...(groupId && { groupId }),
                  isTaskPublic,
                  isTimerPublic,
                });
                setSessionId(session.sessionId);
                onSessionIdChange?.(session.sessionId);
                const hours = Math.floor(targetSeconds / 3600);
                const minutes = Math.floor((targetSeconds % 3600) / 60);
                const secs = targetSeconds % 60;
                cdRef.current?.setTime(hours, minutes, secs);
                // setTime 후 상태 업데이트를 기다리기 위해 setTimeout 사용
                setTimeout(() => {
                  if (cdRef.current) {
                    cdRef.current.start();
                    setRunning(true);
                    setIsRunning(true);
                    if (timerContainerRef.current && openPipWindowRef.current) {
                      openPipWindowRef.current();
                    }
                  }
                }, 0);
              } catch (error) {
                console.error("타이머 시작 실패:", error);
              }
            }}
          />
          {timerEndModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <TimerEndModal
                onClose={handleTimerEndModalClose}
                onConfirm={handleTimerEndModalConfirm}
              />
            </div>
          )}
          <TodoRequiredModal
            isOpen={todoRequiredModalOpen}
            onClose={() => setTodoRequiredModalOpen(false)}
          />
        </>
      )}
    </>
  );
}
