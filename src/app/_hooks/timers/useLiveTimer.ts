"use client";

import { useEffect, useRef, useState } from "react";

interface UseLiveTimerProps {
    serverSeconds: number;
    isRunning: boolean;
    refreshKey?: unknown;
}

/**
 * 서버에서 받은 초기 시간과 실행 상태를 기반으로 실시간으로 흐르는 시간을 관리하는 Hook
 */
export function useLiveTimer({ serverSeconds, isRunning, refreshKey }: UseLiveTimerProps) {
    const [liveSeconds, setLiveSeconds] = useState(serverSeconds);
    // 현재 표시 중인 liveSeconds를 ref로 추적 (재개 시 기준값으로 사용)
    const liveSecondsRef = useRef(serverSeconds);
    const syncTimeRef = useRef(Date.now());
    const syncBaseRef = useRef(serverSeconds);

    // liveSeconds를 업데이트할 때 ref도 함께 갱신
    const updateLiveSeconds = (v: number) => {
        liveSecondsRef.current = v;
        setLiveSeconds(v);
    };

    // serverSeconds가 실제로 바뀔 때만 기준값 갱신
    // ⚠️ isRunning은 deps에 포함하지 않음 — 휴식 클릭 시 liveSeconds가 되돌아가는 버그 방지
    useEffect(() => {
        updateLiveSeconds(serverSeconds);
        syncBaseRef.current = serverSeconds;
        syncTimeRef.current = Date.now();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverSeconds, refreshKey]);

    // isRunning이 false → true(재개)로 바뀌는 순간
    // ✅ syncBase를 serverSeconds가 아닌 현재 표시값(liveSecondsRef)으로 설정
    //    → 휴식 중 멈췄던 시간에서 이어서 카운팅
    useEffect(() => {
        if (isRunning) {
            syncBaseRef.current = liveSecondsRef.current; // 현재 표시값 기준!
            syncTimeRef.current = Date.now();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning]);

    // 실시간 업데이트: running일 때만 1초마다 증가
    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - syncTimeRef.current) / 1000);
            const newValue = syncBaseRef.current + elapsed;
            liveSecondsRef.current = newValue;
            setLiveSeconds(newValue);
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning]);

    return liveSeconds;
}

