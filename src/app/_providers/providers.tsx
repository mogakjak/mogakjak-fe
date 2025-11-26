"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TimerProvider, useTimer } from "@/app/_contexts/TimerContext";
import { useBlockPageNavigation } from "@/app/_hooks/block/useBlockPageNavigation";
import dynamic from "next/dynamic";
import { useFinishActiveTimer } from "@/app/_hooks/timers/useFinishActiveTimer";

const TimerEndModal = dynamic(
  () => import("@/app/_components/common/timerEndModal"),
  { ssr: false }
);

const queryClient = new QueryClient();

function NavigationBlocker() {
  useBlockPageNavigation();
  return null;
}

function NavigationModal() {
  const { pendingNavigation, closeNavigationModal, setIsRunning } = useTimer();
  const finishActiveTimerMutation = useFinishActiveTimer();

  if (!pendingNavigation) return null;

  const handleConfirm = async () => {
    try {
      // 타이머 종료
      await finishActiveTimerMutation.mutateAsync(undefined);
      // 타이머 상태를 false로 설정
      setIsRunning(false);
      // 원래 하려던 네비게이션 동작 실행
      await pendingNavigation.onConfirm();
    } catch (error) {
      console.error("타이머 종료 실패:", error);
      // 실패해도 타이머 상태를 false로 설정
      setIsRunning(false);
      // 실패해도 네비게이션은 진행
      await pendingNavigation.onConfirm();
    } finally {
      closeNavigationModal();
    }
  };

  const handleClose = () => {
    closeNavigationModal();
    // 취소 시에는 아무것도 하지 않음 (현재 페이지에 그대로)
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <TimerEndModal onClose={handleClose} onConfirm={handleConfirm} />
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TimerProvider>
        <NavigationBlocker />
        <NavigationModal />
        {children}
      </TimerProvider>
    </QueryClientProvider>
  );
}
