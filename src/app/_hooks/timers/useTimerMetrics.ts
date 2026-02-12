import { useRef, useCallback } from "react";
import { sendGAEvent } from "@next/third-parties/google";

type TimerType = "pomodoro" | "stopwatch" | "timer";

interface StartTrackingOptions {
    action?: "new" | "resume";
    target_duration?: number;
    break_duration?: number;
}

interface FinalizeMetricsOptions {
    total_rounds?: number;
}

interface GA4EventParams {
    timer_type?: TimerType;
    timer_action?: "new" | "resume";
    target_duration?: number;
    break_duration?: number;
    session_id?: string | null;
    actual_focus_time?: number;
    total_break_time?: number;
    total_rounds?: number;
}

export function useTimerMetrics() {
    const startTimeRef = useRef<number | null>(null);
    const totalBreakDurationRef = useRef<number>(0);
    const pauseStartTimeRef = useRef<number | null>(null);

    /**
     * 타이머 시작 추적
     * @param timerType - 타이머 타입 (pomodoro, stopwatch, timer)
     * @param options - 시작 옵션 (action, targetDuration, breakDuration)
     */
    const startTracking = useCallback(
        (
            timerType: TimerType,
            options?: StartTrackingOptions
        ) => {
            const { action = "new", target_duration, break_duration } = options || {};

            // 신규 시작이면 모든 값 초기화
            if (action === "new") {
                startTimeRef.current = Date.now();
                totalBreakDurationRef.current = 0;
                pauseStartTimeRef.current = null;
            }

            // GA4 이벤트 전송
            const eventParams: GA4EventParams = {
                timer_type: timerType,
                timer_action: action,
            };

            if (target_duration !== undefined) {
                eventParams.target_duration = target_duration;
            }

            if (break_duration !== undefined) {
                eventParams.break_duration = break_duration;
            }

            sendGAEvent("event", "timer_start", eventParams);
        },
        []
    );

    /**
     * 타이머 일시정지 추적
     * @param timerType - 타이머 타입
     * @param sessionId - 세션 ID
     */
    const pauseTracking = useCallback(
        (timerType: TimerType, sessionId: string | null) => {
            // 일시정지 시작 시간 기록
            pauseStartTimeRef.current = Date.now();

            // GA4 이벤트 전송
            sendGAEvent("event", "timer_pause", {
                timer_type: timerType,
                session_id: sessionId,
            });
        },
        []
    );

    /**
     * 타이머 재개 시 휴식 시간 누적
     */
    const resumeTracking = useCallback(() => {
        if (pauseStartTimeRef.current) {
            const breakSegment = Math.floor(
                (Date.now() - pauseStartTimeRef.current) / 1000
            );
            totalBreakDurationRef.current += breakSegment;
            pauseStartTimeRef.current = null;
        }
    }, []);

    /**
     * 타이머 종료/완료 시 최종 메트릭 계산 및 전송
     * @param timerType - 타이머 타입
     * @param sessionId - 세션 ID
     * @param options - 완료 옵션 (totalRounds 등)
     */
    const finalizeMetrics = useCallback(
        (
            timerType: TimerType,
            sessionId: string | null,
            options?: FinalizeMetricsOptions
        ) => {
            if (!sessionId || !startTimeRef.current) {
                return;
            }

            // 전체 경과 시간 계산 (초 단위)
            const totalElapsed = Math.floor(
                (Date.now() - startTimeRef.current) / 1000
            );

            // 순수 집중 시간 = 전체 경과 시간 - 누적 휴식 시간
            const pureActiveTime = totalElapsed - totalBreakDurationRef.current;

            // GA4 이벤트 전송
            const eventParams: GA4EventParams = {
                timer_type: timerType,
                session_id: sessionId,
                actual_focus_time: pureActiveTime,
                total_break_time: totalBreakDurationRef.current,
            };

            if (options?.total_rounds !== undefined) {
                eventParams.total_rounds = options.total_rounds;
            }

            sendGAEvent("event", "timer_stop", eventParams);

            // 메트릭 초기화
            startTimeRef.current = null;
            totalBreakDurationRef.current = 0;
            pauseStartTimeRef.current = null;
        },
        []
    );

    return {
        startTracking,
        pauseTracking,
        resumeTracking,
        finalizeMetrics,
    };
}
