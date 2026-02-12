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
import AlertModal from "./alertModal";
import ActiveSessionModal from "./activeSessionModal";
import { useStartPomodoro } from "@/app/_hooks/timers/useStartPomodoro";
import { usePauseTimer } from "@/app/_hooks/timers/usePauseTimer";
import { useResumeTimer } from "@/app/_hooks/timers/useResumeTimer";
import { useFinishTimer } from "@/app/_hooks/timers/useFinishTimer";
import { useStartTimer } from "@/app/_hooks/timers/useStartTimer";
import { useStartStopwatch } from "@/app/_hooks/timers/useStartStopwatch";
import { useFinishActiveTimer } from "@/app/_hooks/timers/useFinishActiveTimer";
import { useTimer } from "@/app/_contexts/TimerContext";
import { usePictureInPicture } from "@/app/_hooks/timers/usePictureInPicture";
import { useBrowserNotification } from "@/app/_hooks/_websocket/notifications/useBrowserNotification";
import { sendGAEvent } from "@next/third-parties/google";

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
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [activeSessionModalOpen, setActiveSessionModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);
  const [pendingStopwatchConfig, setPendingStopwatchConfig] = useState<{
    todoId: string;
    participationType: "INDIVIDUAL" | "GROUP";
    groupId?: string;
    isTaskPublic?: boolean;
    isTimerPublic?: boolean;
  } | null>(null);

  const [pomodoroConfig, setPomodoroConfig] = useState<{
    focusSeconds: number;
    breakSeconds: number;
    repeatCount: number;
  } | null>(null);
  const [currentPhase, setCurrentPhase] = useState<"FOCUS" | "BREAK">("FOCUS");
  const [currentRound, setCurrentRound] = useState<number>(1);

  const sessionIdRef = useRef<string | null>(null);
  const setSessionId = (value: string | null) => {
    sessionIdRef.current = value;
  };

  const [isPaused, setIsPaused] = useState<boolean>(false);

  const { setIsRunning } = useTimer();
  const startPomodoroMutation = useStartPomodoro();
  const pauseTimerMutation = usePauseTimer();
  const resumeTimerMutation = useResumeTimer();
  const finishTimerMutation = useFinishTimer();
  const startTimerMutation = useStartTimer();
  const startStopwatchMutation = useStartStopwatch();
  const finishActiveTimerMutation = useFinishActiveTimer();

  const pomoRef = useRef<PomodoroDialHandle>(null);
  const swRef = useRef<StopwatchHandle>(null);
  const cdRef = useRef<CountdownHandle>(null);
  const timerContainerRef = useRef<HTMLElement | null>(null);
  const openPipWindowRef = useRef<(() => Promise<boolean>) | null>(null);
  const isInPipRef = useRef<boolean>(false);
  // 휴식 측정 시간
  const pauseStartTimeRef = useRef<number | null>(null);

  const { isInPip, openPipWindow, closePipWindow } = usePictureInPicture({
    containerRef: timerContainerRef,
    isRunning: running,
  });
  const { isSupported, permission, requestPermission, showNotification } =
    useBrowserNotification();

  openPipWindowRef.current = openPipWindow;
  isInPipRef.current = isInPip;

  const handlePipToggle = useCallback(() => {
    if (isInPip) {
      closePipWindow();
    } else {
      openPipWindow();
    }
  }, [isInPip, openPipWindow, closePipWindow]);

  const handlePomodoroStart = useCallback(
    async (focusSeconds: number, breakSeconds: number, repeatCount: number) => {
      setPomodoroConfig({ focusSeconds, breakSeconds, repeatCount });
      setCurrentPhase("FOCUS");
      setCurrentRound(1);
      setIsPaused(false);


      sendGAEvent("event", "timer_start", {
        timerType: "pomodoro",
        timerAction: "new",
        targetDuration: focusSeconds,
      });
      if (!todoId) {
        sendGAEvent("event", "timer_start_failed", { timerType: "pomodoro", reason: "missing_todo" });
        setAlertModalOpen(true);
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
    [
      todoId,
      groupId,
      startPomodoroMutation,
      setIsRunning,
      isTaskPublic,
      isTimerPublic,
      onSessionIdChange,
    ]
  );

  const onStart = useCallback(async () => {
    if (!todoId) {
      sendGAEvent("event", "timer_start_failed", { timerType: mode, reason: "missing_todo" });
      setAlertModalOpen(true);
      return;
    }

    let breakDuration = 0;
    if (pauseStartTimeRef.current) {
      breakDuration = Math.floor((Date.now() - pauseStartTimeRef.current) / 1000); // 초 단위 변환
      pauseStartTimeRef.current = null;
    }

    if (mode === "pomodoro") {
      if (isPaused && sessionIdRef.current) {

        sendGAEvent("event", "timer_start", {
          timerType: "pomodoro",
          timerAction: "resume",
          breakDuration: breakDuration,
        });
        try {
          await resumeTimerMutation.mutateAsync(sessionIdRef.current);
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
      if (isPaused && sessionIdRef.current) {
        sendGAEvent("event", "timer_start", {
          timerType: "stopwatch",
          timerAction: "resume",
          breakDuration: breakDuration,
        })
        try {
          await resumeTimerMutation.mutateAsync(sessionIdRef.current);
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
        sendGAEvent("event", "timer_start", {
          timerType: "stopwatch",
          timerAction: "new",
          breakDuration: 0, // 신규 시작이므로 휴식 시간 없음
        });
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
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes("이미") ||
            errorMessage.includes("already") ||
            errorMessage.includes("running")
          ) {
            setPendingStopwatchConfig({
              todoId,
              participationType: groupId ? "GROUP" : "INDIVIDUAL",
              ...(groupId && { groupId }),
              isTaskPublic,
              isTimerPublic,
            });
            setActiveSessionModalOpen(true);
          }
        }
      }
    } else if (mode === "timer") {
      if (isPaused && sessionIdRef.current) {
        sendGAEvent("event", "timer_start", {
          timerType: "timer",
          timerAction: "resume",
          breakDuration: breakDuration,
        });
        try {
          await resumeTimerMutation.mutateAsync(sessionIdRef.current);
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
        setTimerModalOpen(true);
      }
    }
  }, [
    mode,
    isPaused,
    resumeTimerMutation,
    startStopwatchMutation,
    todoId,
    groupId,
    setIsRunning,
    onSessionIdChange,
    isTaskPublic,
    isTimerPublic,
  ]);

  const onPause = useCallback(async () => {

    // 휴식 시작 시간 기록
    pauseStartTimeRef.current = Date.now();
    sendGAEvent("event", "timer_pause", {
      timerType: mode,
      sessionId: sessionIdRef.current,
    });

    const effectiveSessionId = sessionIdRef.current;


    if (!effectiveSessionId) {
      // sessionId 없이 로컬 타이머만 사용하는 경우
      if (mode === "pomodoro") pomoRef.current?.pause();
      else if (mode === "stopwatch") swRef.current?.pause();
      else cdRef.current?.pause();
      setRunning(false);
      setIsPaused(true);
      setIsRunning(false);
      return;
    }

    try {
      await pauseTimerMutation.mutateAsync(effectiveSessionId);
      if (mode === "pomodoro") pomoRef.current?.pause();
      else if (mode === "stopwatch") swRef.current?.pause();
      else cdRef.current?.pause();
      setRunning(false);
      setIsPaused(true);
      setIsRunning(false);
    } catch (error) {
      console.error("타이머 정지 실패:", error);
    }
  }, [mode, pauseTimerMutation, setIsRunning]);
  const onStop = useCallback(async () => {
    const effectiveSessionId = sessionIdRef.current;


    if (effectiveSessionId) {
      sendGAEvent("event", "timer_stop", {
        timerType: mode,
        sessionId: effectiveSessionId,
      });
    }

    if (mode === "pomodoro") {
      if (effectiveSessionId) {
        try {

          await finishTimerMutation.mutateAsync(effectiveSessionId);
        } catch (error) {
          console.error("타이머 종료 실패:", error);
        }
      } else {
        console.warn(
          "[onStop] pomodoro 종료 시 sessionId 없음 - 이미 종료된 세션일 수 있음"
        );
      }

      pomoRef.current?.stop();
      setPomodoroConfig(null);
      setCurrentPhase("FOCUS");
      setCurrentRound(1);
      setSessionId(null);
      onSessionIdChange?.(null);
      setIsPaused(false);
      setRunning(false);
      setIsRunning(false);
      return;
    }

    if (mode === "stopwatch") {
      if (effectiveSessionId) {
        try {

          await finishTimerMutation.mutateAsync(effectiveSessionId);
        } catch (error) {
          console.error("스톱워치 종료 실패:", error);
        }
      }
      swRef.current?.stop();
      setSessionId(null);
      onSessionIdChange?.(null);
      setIsPaused(false);
      setRunning(false);
      setIsRunning(false);
      return;
    }

    // mode === "timer"
    if (effectiveSessionId) {
      try {
        await finishTimerMutation.mutateAsync(effectiveSessionId);
      } catch (error) {
        console.error("타이머 종료 실패:", error);
      }
    }
    cdRef.current?.reset();
    setSessionId(null);
    onSessionIdChange?.(null);
    setIsPaused(false);
    setRunning(false);
    setIsRunning(false);
  }, [
    mode,
    finishTimerMutation,
    setIsRunning,
    onSessionIdChange,
  ]);

  const handlePomodoroComplete = useCallback(
    async () => {


      if (!pomodoroConfig) return;

      const { focusSeconds, breakSeconds, repeatCount } = pomodoroConfig;

      if (currentPhase === "FOCUS") {
        if (currentRound < repeatCount) {
          const breakMinutes = breakSeconds / 60;

          setCurrentPhase("BREAK");
          setRunning(true);
          setIsRunning(true);



          pomoRef.current?.reset(breakMinutes);
          pomoRef.current?.start();
          return;
        }

        sendGAEvent("event", "timer_complete", {
          timerType: "pomodoro",
          sessionId: sessionIdRef.current,
          totalRounds: repeatCount
        });

        await onStop();

        if (isSupported) {
          const title = "뽀모도로가 완료되었어요";
          const body = "모든 집중 시간을 완료했습니다!";

          if (permission === "granted") {
            showNotification(title, {
              body,
              icon: "/chorme/notificationIcon.png",
              badge: "/chorme/notificationIcon.png",
              tag: `pomodoro-complete-${sessionIdRef.current || Date.now()}`,
            });
          } else if (permission === "default") {
            requestPermission().then((granted) => {
              if (granted) {
                showNotification(title, {
                  body,
                  icon: "/chorme/notificationIcon.png",
                  badge: "/chorme/notificationIcon.png",
                  tag: `pomodoro-complete-${sessionIdRef.current || Date.now()}`,
                });
              }
            });
          }
        }

        return;
      }

      const nextRound = currentRound + 1;

      if (nextRound > repeatCount) {
        await onStop();

        if (isSupported) {
          const title = "뽀모도로가 완료되었어요";
          const body = "모든 집중 시간을 완료했습니다!";

          if (permission === "granted") {
            showNotification(title, {
              body,
              icon: "/chorme/notificationIcon.png",
              badge: "/chorme/notificationIcon.png",
              tag: `pomodoro-complete-${sessionIdRef.current || Date.now()}`,
            });
          } else if (permission === "default") {
            requestPermission().then((granted) => {
              if (granted) {
                showNotification(title, {
                  body,
                  icon: "/chorme/notificationIcon.png",
                  badge: "/chorme/notificationIcon.png",
                  tag: `pomodoro-complete-${sessionIdRef.current || Date.now()}`,
                });
              }
            });
          }
        }

        return;
      }

      setCurrentPhase("FOCUS");
      setCurrentRound(nextRound);
      setRunning(true);
      setIsRunning(true);



      const focusMinutes = focusSeconds / 60;
      pomoRef.current?.reset(focusMinutes);
      pomoRef.current?.start();
    },
    [
      pomodoroConfig,
      currentPhase,
      currentRound,
      onStop,
      setIsRunning,
      isSupported,
      permission,
      requestPermission,
      showNotification,
    ]
  );

  const onSwitch = (m: Mode) => {
    if (sessionIdRef.current) {
      setTimerEndModalOpen(true);
      setPendingMode(m);
    } else {
      onStop();
      setMode(m);
    }
  };

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
          onComplete={async () => {
            sendGAEvent("event", "timer_complete", {
              timerType: "timer",
              sessionId: sessionIdRef.current,
            });
            await onStop();

            if (isSupported) {
              const title = "타이머가 끝났습니다!";
              const body = "목표를 달성하셨나요? 다 마쳤다면 종료 버튼을, 시간이 더 필요하다면 타이머를 다시 시작해 보세요.";

              if (permission === "granted") {
                showNotification(title, {
                  body,
                  icon: "/chorme/notificationIcon.png",
                  badge: "/chorme/notificationIcon.png",
                  tag: `timer-complete-${sessionIdRef.current || Date.now()}`,
                });
              } else if (permission === "default") {
                requestPermission().then((granted) => {
                  if (granted) {
                    showNotification(title, {
                      body,
                      icon: "/chorme/notificationIcon.png",
                      badge: "/chorme/notificationIcon.png",
                      tag: `timer-complete-${sessionIdRef.current || Date.now()}`,
                    });
                  }
                });
              }
            }
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
    onStop,
    isSupported,
    permission,
    requestPermission,
    showNotification,
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

  const handleActiveSessionModalClose = useCallback(() => {
    setActiveSessionModalOpen(false);
    setPendingStopwatchConfig(null);
  }, []);

  const handleActiveSessionModalConfirm = useCallback(async () => {
    setActiveSessionModalOpen(false);
    if (pendingStopwatchConfig) {
      try {
        // 기존 활성 세션 종료
        await finishActiveTimerMutation.mutateAsync();
        // 새 스톱워치 시작
        const session = await startStopwatchMutation.mutateAsync(
          pendingStopwatchConfig
        );
        setSessionId(session.sessionId);
        onSessionIdChange?.(session.sessionId);
        swRef.current?.start();
        setRunning(true);
        setIsPaused(false);
        setIsRunning(true);
        if (timerContainerRef.current && openPipWindowRef.current) {
          openPipWindowRef.current();
        }
        setPendingStopwatchConfig(null);
      } catch (error) {
        console.error("기존 세션 종료 및 새 스톱워치 시작 실패:", error);
        setPendingStopwatchConfig(null);
      }
    }
  }, [
    pendingStopwatchConfig,
    finishActiveTimerMutation,
    startStopwatchMutation,
    onSessionIdChange,
    setIsRunning,
  ]);

  return (
    <>
      <div data-timer-container-parent>
        <section
          ref={(el) => {
            timerContainerRef.current = el;
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
                sendGAEvent("event", "timer_start_failed", { timerType: "timer", reason: "missing_todo" });
                setTimerModalOpen(false);
                setAlertModalOpen(true);
                return;
              }
              try {
                sendGAEvent("event", "timer_start", {
                  timerType: "timer",
                  timerAction: "new",
                  targetDuration: targetSeconds
                });
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
          <AlertModal
            isOpen={alertModalOpen}
            onClose={() => setAlertModalOpen(false)}
            type="todoRequired"
          />
          {activeSessionModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <ActiveSessionModal
                onClose={handleActiveSessionModalClose}
                onConfirm={handleActiveSessionModalConfirm}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
