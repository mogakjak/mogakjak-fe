"use client";

import { useTimer } from "@/app/_contexts/TimerContext";
import { useFinishActiveTimer } from "@/app/_hooks/timers/useFinishActiveTimer";
import dynamic from "next/dynamic";

// TimerEndModal을 동적 import로 로드
const TimerEndModal = dynamic(
  () => import("@/app/_components/common/timerEndModal"),
  { ssr: false }
);

export default function NavigationModal() {
  const { pendingNavigation, closeNavigationModal, setIsRunning } = useTimer();
  const finishActiveTimerMutation = useFinishActiveTimer();

  if (!pendingNavigation) return null;

  const handleConfirm = async () => {
    try {
      await finishActiveTimerMutation.mutateAsync(undefined);
      setIsRunning(false);
      await pendingNavigation.onConfirm();
    } catch (error) {
      console.error("타이머 종료 실패:", error);
      setIsRunning(false);
      await pendingNavigation.onConfirm();
    } finally {
      closeNavigationModal();
    }
  };

  const handleClose = () => {
    closeNavigationModal();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <TimerEndModal onClose={handleClose} onConfirm={handleConfirm} />
    </div>
  );
}
