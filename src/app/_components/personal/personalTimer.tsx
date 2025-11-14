"use client";

import { useEffect, useState } from "react";
import { useTimerSocket } from "../../_api/timer/useTimerSocket";
import TimerCTA from "../common/timerCTA";
import Image from "next/image";

interface PersonalTimerProps {
  userId?: string | number;
}

export default function PersonalTimer({ userId }: PersonalTimerProps) {
  const { isConnected, isConnecting, timerData, error, startTimer, stopTimer } =
    useTimerSocket(userId);
  const [localRemaining, setLocalRemaining] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // 서버에서 받은 데이터로 상태 업데이트
  // 서버가 1초마다 remainingSeconds를 보내주므로, 그 값을 그대로 사용
  useEffect(() => {
    if (timerData) {
      console.log("=".repeat(50));
      console.log("📥 [PersonalTimer] 서버에서 타이머 업데이트 받음!");
      console.log("📊 전체 데이터:", JSON.stringify(timerData, null, 2));
      console.log("📊 status:", timerData.status);
      console.log("📊 remainingSeconds:", timerData.remainingSeconds);
      console.log("📊 sessionId:", timerData.sessionId);
      console.log("=".repeat(50));

      // 서버에서 remainingSeconds를 보내주면 그 값을 그대로 사용
      if (timerData.remainingSeconds !== undefined) {
        const prevRemaining = localRemaining;
        setLocalRemaining(timerData.remainingSeconds);
        console.log(
          `⏱️ [PersonalTimer] 남은 시간 업데이트: ${prevRemaining}초 → ${timerData.remainingSeconds}초`
        );
      } else {
        console.warn("⚠️ [PersonalTimer] remainingSeconds가 undefined입니다!");
      }

      // 서버 상태에 따라 isRunning 설정
      const prevRunning = isRunning;
      setIsRunning(timerData.status === "RUNNING");
      if (prevRunning !== (timerData.status === "RUNNING")) {
        console.log(
          `🔄 [PersonalTimer] 실행 상태 변경: ${prevRunning} → ${
            timerData.status === "RUNNING"
          }`
        );
      }

      // 타이머 완료 처리
      if (timerData.status === "FINISHED") {
        setIsRunning(false);
        if (timerData.remainingSeconds !== undefined) {
          setLocalRemaining(timerData.remainingSeconds);
        } else {
          setLocalRemaining(0);
        }
        console.log("✅ [PersonalTimer] 타이머 완료!");
      }

      // 타이머 일시정지 처리
      if (timerData.status === "PAUSED") {
        setIsRunning(false);
        console.log("⏸️ [PersonalTimer] 타이머 일시정지");
      }

      // 타이머 대기 상태
      if (timerData.status === "IDLE") {
        setIsRunning(false);
        console.log("⏸️ [PersonalTimer] 타이머 대기 중");
      }
    } else {
      console.log("ℹ️ [PersonalTimer] timerData가 null입니다.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerData]);

  // 로컬 카운트다운 제거 - 서버가 1초마다 업데이트를 보내주므로 불필요

  const formatTime = (seconds: number | null): string => {
    if (seconds === null || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStart = () => {
    // 기본 30분 (1800초) 타이머 시작
    const targetSeconds = 1800;

    // 서버로 요청 전송만 하고, 서버 응답을 기다림
    startTimer({
      timerMode: "TIMER",
      targetSeconds,
    });
    console.log(
      "타이머 시작 요청 전송:",
      targetSeconds,
      "초 (서버 응답 대기 중...)"
    );
  };

  const handleStop = () => {
    stopTimer();
    setIsRunning(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-[20px] shadow-sm">
      <h2 className="text-heading4-20SB text-black mb-6">개인 타이머</h2>

      {/* 연결 상태 */}
      <div className="mb-4 flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected
              ? "bg-green-500"
              : isConnecting
              ? "bg-orange-500 animate-pulse"
              : "bg-red-500"
          }`}
        />
        <span className="text-body2-14R text-gray-600">
          {isConnected
            ? "연결됨"
            : isConnecting
            ? "연결 중..."
            : error
            ? "연결 실패"
            : "대기 중"}
        </span>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-body2-14R text-red-600">{error}</p>
        </div>
      )}

      {/* 타이머 표시 */}
      <div className="flex flex-col items-center gap-6 mb-6">
        <div className="text-6xl font-bold text-gray-900">
          {formatTime(localRemaining)}
        </div>

        <div className="text-center space-y-1">
          <p className="text-body1-16R text-gray-600">
            상태: {isRunning ? "실행 중" : "정지"}
          </p>
          {timerData && (
            <>
              <p className="text-body2-14R text-gray-500">
                서버 상태: {timerData.status}
              </p>
              {timerData.mode && (
                <p className="text-body2-14R text-gray-500">
                  모드: {timerData.mode}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex flex-col gap-3">
        {!isRunning ? (
          <TimerCTA
            variant="primary"
            size="big"
            onClick={handleStart}
            disabled={!isConnected}
          >
            <Image src="/Icons/start.svg" alt="시작" width={20} height={20} />
            타이머 시작
          </TimerCTA>
        ) : (
          <TimerCTA
            variant="secondary"
            size="big"
            onClick={handleStop}
            disabled={!isConnected}
          >
            <Image src="/Icons/stop.svg" alt="정지" width={20} height={20} />
            타이머 정지
          </TimerCTA>
        )}
      </div>

      {/* 디버그 정보 (개발용) */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-body2-14R text-gray-500 mb-2">연결 정보:</p>
        <div className="text-xs text-gray-600 space-y-1">
          <p>
            연결 상태:{" "}
            {isConnected
              ? "✅ 연결됨"
              : isConnecting
              ? "🔄 연결 중"
              : "❌ 미연결"}
          </p>
          <p>사용자 ID: {userId || "없음"}</p>
          <p>
            WebSocket URL:{" "}
            {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/ws
          </p>
          {error && <p className="text-red-600">오류: {error}</p>}
        </div>
        {timerData && (
          <>
            <p className="text-body2-14R text-gray-500 mb-2 mt-4">
              타이머 데이터:
            </p>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(timerData, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
