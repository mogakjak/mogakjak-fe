"use client";

import { useEffect, useState } from "react";

interface UseLiveTimerProps {
    serverSeconds: number;
    isRunning: boolean;
    refreshKey?: unknown; // 추가적인 동기화 트리거 (예: isRunning 상태 변화 등)
}

/**
 * 서버에서 받은 초기 시간과 실행 상태를 기반으로 실시간으로 흐르는 시간을 관리하는 Hook
 */
export function useLiveTimer({ serverSeconds, isRunning, refreshKey }: UseLiveTimerProps) {
    const [liveSeconds, setLiveSeconds] = useState(serverSeconds);
    const [syncTime, setSyncTime] = useState(Date.now());

    // 서버 데이터 또는 실행 상태가 변경될 때 동기화
    useEffect(() => {
        setLiveSeconds(serverSeconds);
        setSyncTime(Date.now());
    }, [serverSeconds, isRunning, refreshKey]);

    // 실시간 업데이트
    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - syncTime) / 1000);
            setLiveSeconds(serverSeconds + elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, serverSeconds, syncTime]);

    return liveSeconds;
}
