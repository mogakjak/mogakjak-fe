"use client";

import { useState, useCallback } from "react";
import { useStartPomodoro } from "./useStartPomodoro";
import { useStartTimer } from "./useStartTimer";
import { useStartStopwatch } from "./useStartStopwatch";
import { usePauseTimer } from "./usePauseTimer";
import { useResumeTimer } from "./useResumeTimer";
import { useFinishTimer } from "./useFinishTimer";
import { useFinishActiveTimer } from "./useFinishActiveTimer";
import type { PomodoroSession } from "../../api/timers/api";

export type Mode = "pomodoro" | "stopwatch" | "timer";

export type TimerConfig = {
    mode: Mode;
    todoId: string;
    participationType: "INDIVIDUAL" | "GROUP";
    groupId?: string;
    isTaskPublic?: boolean;
    isTimerPublic?: boolean;
    // timer specific
    targetSeconds?: number;
    // pomodoro specific
    focusSeconds?: number;
    breakSeconds?: number;
    repeatCount?: number;
};

type UseTimerControlProps = {
    onSessionIdChange?: (sessionId: string | null) => void;
};

export const useTimerControl = ({
    onSessionIdChange,
}: UseTimerControlProps = {}) => {
    const [pendingSessionConfig, setPendingSessionConfig] =
        useState<TimerConfig | null>(null);
    const [activeSessionModalOpen, setActiveSessionModalOpen] = useState(false);

    const startPomodoroMutation = useStartPomodoro();
    const startTimerMutation = useStartTimer();
    const startStopwatchMutation = useStartStopwatch();
    const pauseTimerMutation = usePauseTimer();
    const resumeTimerMutation = useResumeTimer();
    const finishTimerMutation = useFinishTimer();
    const finishActiveTimerMutation = useFinishActiveTimer();

    const handleStartError = (error: unknown, config: TimerConfig) => {
        console.error(`${config.mode} 시작 실패:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (
            errorMessage.includes("이미") ||
            errorMessage.includes("already") ||
            errorMessage.includes("running")
        ) {
            setPendingSessionConfig(config);
            setActiveSessionModalOpen(true);
            return true; // Handled as duplicate session
        }
        return false; // Other error
    };

    const startSession = useCallback(
        async (config: TimerConfig): Promise<PomodoroSession | null> => {
            try {
                let session: PomodoroSession;

                if (config.mode === "pomodoro") {
                    if (
                        !config.focusSeconds ||
                        !config.breakSeconds ||
                        !config.repeatCount
                    ) {
                        throw new Error("Missing pomodoro config");
                    }
                    session = await startPomodoroMutation.mutateAsync({
                        todoId: config.todoId,
                        focusSeconds: config.focusSeconds,
                        breakSeconds: config.breakSeconds,
                        repeatCount: config.repeatCount,
                        participationType: config.participationType,
                        groupId: config.groupId,
                        isTaskPublic: config.isTaskPublic,
                        isTimerPublic: config.isTimerPublic,
                    });
                } else if (config.mode === "stopwatch") {
                    session = await startStopwatchMutation.mutateAsync({
                        todoId: config.todoId,
                        participationType: config.participationType,
                        groupId: config.groupId,
                        isTaskPublic: config.isTaskPublic,
                        isTimerPublic: config.isTimerPublic,
                    });
                } else {
                    // timer
                    if (!config.targetSeconds) {
                        throw new Error("Missing timer config");
                    }
                    session = await startTimerMutation.mutateAsync({
                        todoId: config.todoId,
                        targetSeconds: config.targetSeconds,
                        participationType: config.participationType,
                        groupId: config.groupId,
                        isTaskPublic: config.isTaskPublic,
                        isTimerPublic: config.isTimerPublic,
                    });
                }

                onSessionIdChange?.(session.sessionId);
                return session;
            } catch (error) {
                handleStartError(error, config);
                return null;
            }
        },
        [
            startPomodoroMutation,
            startStopwatchMutation,
            startTimerMutation,
            onSessionIdChange,
        ]
    );

    const retryStartSession = useCallback(async (): Promise<PomodoroSession | null> => {
        if (!pendingSessionConfig) return null;
        try {
            await finishActiveTimerMutation.mutateAsync();
            const session = await startSession(pendingSessionConfig);
            setPendingSessionConfig(null);
            setActiveSessionModalOpen(false);
            return session;
        } catch (error) {
            console.error("재시도 실패:", error);
            return null;
        }
    }, [pendingSessionConfig, finishActiveTimerMutation, startSession]);

    const pauseSession = useCallback(
        async (sessionId: string) => {
            try {
                await pauseTimerMutation.mutateAsync(sessionId);
            } catch (error) {
                console.error("일시정지 실패:", error);
                throw error;
            }
        },
        [pauseTimerMutation]
    );

    const resumeSession = useCallback(
        async (sessionId: string) => {
            try {
                await resumeTimerMutation.mutateAsync(sessionId);
            } catch (error) {
                console.error("재개 실패:", error);
                throw error;
            }
        },
        [resumeTimerMutation]
    );

    const stopSession = useCallback(
        async (sessionId: string) => {
            try {
                await finishTimerMutation.mutateAsync(sessionId);
            } catch (error) {
                console.error("종료 실패:", error);
                throw error;
            }
        },
        [finishTimerMutation]
    );

    const closeActiveSessionModal = useCallback(() => {
        setActiveSessionModalOpen(false);
        setPendingSessionConfig(null);
    }, []);

    return {
        startSession,
        retryStartSession,
        pauseSession,
        resumeSession,
        stopSession,
        pendingSessionConfig,
        activeSessionModalOpen,
        closeActiveSessionModal,
    };
};
