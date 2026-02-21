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
import {
  useTimerControl,
  type Mode,
  type TimerConfig,
} from "@/app/_hooks/timers/useTimerControl";
import { useTimer } from "@/app/_contexts/TimerContext";
import { usePictureInPicture } from "@/app/_hooks/timers/usePictureInPicture";
import { useBrowserNotification } from "@/app/_hooks/_websocket/notifications/useBrowserNotification";
import { useTimerMetrics } from "@/app/_hooks/timers/useTimerMetrics";
import { sendGAEvent } from "@next/third-parties/google";
import type { PomodoroSession } from "@/app/api/timers/api";

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
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);

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
  const { startTracking, pauseTracking, resumeTracking, finalizeMetrics } =
    useTimerMetrics();

  const {
    startSession,
    retryStartSession,
    pauseSession,
    resumeSession,
    stopSession,
    pendingSessionConfig,
    activeSessionModalOpen,
    closeActiveSessionModal,
  } = useTimerControl({ onSessionIdChange });

  const pomoRef = useRef<PomodoroDialHandle>(null);
  const swRef = useRef<StopwatchHandle>(null);
  const cdRef = useRef<CountdownHandle>(null);
  const timerContainerRef = useRef<HTMLElement | null>(null);
  const openPipWindowRef = useRef<(() => Promise<boolean>) | null>(null);
  const isInPipRef = useRef<boolean>(false);

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

  const handleSessionStarted = useCallback(
    (session: PomodoroSession, config: TimerConfig) => {
      setSessionId(session.sessionId);
      setRunning(true);
      setIsPaused(false);
      setIsRunning(true);

      if (config.mode === "pomodoro") {
        startTracking("pomodoro", {
          action: "new",
          target_duration: config.focusSeconds,
        });
        pomoRef.current?.reset(config.focusSeconds! / 60);
        pomoRef.current?.start();
      } else if (config.mode === "stopwatch") {
        startTracking("stopwatch", { action: "new" });
        swRef.current?.start();
      } else if (config.mode === "timer") {
        startTracking("timer", {
          action: "new",
          target_duration: config.targetSeconds,
        });
        const targetSeconds = config.targetSeconds!;
        const hours = Math.floor(targetSeconds / 3600);
        const minutes = Math.floor((targetSeconds % 3600) / 60);
        const secs = targetSeconds % 60;
        cdRef.current?.setTime(hours, minutes, secs);
        setTimeout(() => {
          if (cdRef.current) cdRef.current.start();
        }, 0);
      }

      if (timerContainerRef.current && openPipWindowRef.current) {
        openPipWindowRef.current();
      }
    },
    [startTracking, setIsRunning]
  );

  const handlePomodoroStart = useCallback(
    async (focusSeconds: number, breakSeconds: number, repeatCount: number) => {
      setPomodoroConfig({ focusSeconds, breakSeconds, repeatCount });
      setCurrentPhase("FOCUS");
      setCurrentRound(1);
      setIsPaused(false);

      if (!todoId) {
        sendGAEvent("event", "timer_start_failed", {
          timerType: "pomodoro",
          reason: "missing_todo",
        });
        setAlertModalOpen(true);
        return;
      }

      const config: TimerConfig = {
        mode: "pomodoro",
        todoId,
        focusSeconds,
        breakSeconds,
        repeatCount,
        participationType: groupId ? "GROUP" : "INDIVIDUAL",
        groupId,
        isTaskPublic,
        isTimerPublic,
      };

      const session = await startSession(config);

      if (session) {
        handleSessionStarted(session, config);
      } else {
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
      startSession,
      setIsRunning,
      isTaskPublic,
      isTimerPublic,
      handleSessionStarted,
    ]
  );

  const onStart = useCallback(async () => {
    if (!todoId) {
      sendGAEvent("event", "timer_start_failed", {
        timerType: mode,
        reason: "missing_todo",
      });
      setAlertModalOpen(true);
      return;
    }

    if (mode === "pomodoro") {
      if (isPaused && sessionIdRef.current) {
        resumeTracking();
        try {
          await resumeSession(sessionIdRef.current);
          startTracking("pomodoro", { action: "resume" });
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
        resumeTracking();
        try {
          await resumeSession(sessionIdRef.current);
          startTracking("stopwatch", { action: "resume" });
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
        const config: TimerConfig = {
          mode: "stopwatch",
          todoId,
          participationType: groupId ? "GROUP" : "INDIVIDUAL",
          groupId,
          isTaskPublic,
          isTimerPublic,
        };
        const session = await startSession(config);
        if (session) {
          handleSessionStarted(session, config);
        }
      }
    } else if (mode === "timer") {
      if (isPaused && sessionIdRef.current) {
        resumeTracking();
        try {
          await resumeSession(sessionIdRef.current);
          startTracking("timer", { action: "resume" });
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
    resumeSession,
    todoId,
    groupId,
    setIsRunning,
    isTaskPublic,
    isTimerPublic,
    resumeTracking,
    startTracking,
    startSession,
    handleSessionStarted,
  ]);

  const onPause = useCallback(async () => {
    const effectiveSessionId = sessionIdRef.current;
    pauseTracking(
      mode as "pomodoro" | "stopwatch" | "timer",
      effectiveSessionId
    );

    if (!effectiveSessionId) {
      if (mode === "pomodoro") pomoRef.current?.pause();
      else if (mode === "stopwatch") swRef.current?.pause();
      else cdRef.current?.pause();
      setRunning(false);
      setIsPaused(true);
      setIsRunning(false);
      return;
    }




    try {
      await pauseSession(effectiveSessionId);
      if (mode === "pomodoro") pomoRef.current?.pause();
      else if (mode === "stopwatch") swRef.current?.pause();
      else cdRef.current?.pause();
      setRunning(false);
      setIsPaused(true);
      setIsRunning(false);
    } catch (error) {
      console.error("타이머 정지 실패:", error);
    }
  }, [mode, pauseSession, setIsRunning, pauseTracking]);

  const onStop = useCallback(async () => {
    const effectiveSessionId = sessionIdRef.current;
    finalizeMetrics(
      mode as "pomodoro" | "stopwatch" | "timer",
      effectiveSessionId
    );

    if (effectiveSessionId) {
      try {
        await stopSession(effectiveSessionId);
      } catch (error) {
        console.error("타이머 종료 실패:", error);
      }
    }

    if (mode === "pomodoro") {
      pomoRef.current?.stop();
      setPomodoroConfig(null);
      setCurrentPhase("FOCUS");
      setCurrentRound(1);
    } else if (mode === "stopwatch") {
      swRef.current?.stop();
    } else {
      cdRef.current?.reset();
    }

    setSessionId(null);
    onSessionIdChange?.(null);
    setIsPaused(false);
    setRunning(false);
    setIsRunning(false);
  }, [mode, stopSession, setIsRunning, onSessionIdChange, finalizeMetrics]);

  const handlePomodoroComplete = useCallback(async () => {
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
        timer_type: "pomodoro",
        timer_session_id: sessionIdRef.current,
        total_rounds: repeatCount,
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
  }, [
    pomodoroConfig,
    currentPhase,
    currentRound,
    onStop,
    setIsRunning,
    isSupported,
    permission,
    requestPermission,
    showNotification,
  ]);

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
              timer_type: "timer",
              timer_session_id: sessionIdRef.current,
            });
            await onStop();

            if (isSupported) {
              const title = "타이머가 끝났습니다!";
              const body =
                "목표를 달성하셨나요? 다 마쳤다면 종료 버튼을, 시간이 더 필요하다면 타이머를 다시 시작해 보세요.";
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

  const handleActiveSessionModalConfirm = useCallback(async () => {
    if (pendingSessionConfig) {
      const config = pendingSessionConfig;
      const session = await retryStartSession();
      if (session) {
        handleSessionStarted(session, config);
      }
    }
  }, [pendingSessionConfig, retryStartSession, handleSessionStarted]);

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
                sendGAEvent("event", "timer_start_failed", {
                  timerType: "timer",
                  reason: "missing_todo",
                });
                setTimerModalOpen(false);
                setAlertModalOpen(true);
                return;
              }
              const config: TimerConfig = {
                mode: "timer",
                todoId,
                participationType: groupId ? "GROUP" : "INDIVIDUAL",
                groupId,
                isTaskPublic,
                isTimerPublic,
                targetSeconds,
              };

              // Start Session via hook
              const session = await startSession(config);

              if (session) {
                setTimerModalOpen(false);
                handleSessionStarted(session, config);
              } else {
                // If failed or pending modal triggered, just close timer modal
                setTimerModalOpen(false);
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
                onClose={closeActiveSessionModal}
                onConfirm={handleActiveSessionModalConfirm}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
