import { useCallback } from "react";
import { useTimer } from "@/app/_contexts/TimerContext";

export function useBlockNavigation(onNavigate: () => void | Promise<void>): {
  handleClick: (e: React.MouseEvent<HTMLElement>) => void;
  isRunning: boolean;
} {
  const { isRunning, showNavigationModal, navigationInterceptor } = useTimer();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      // 네비게이션 인터셉터가 있으면 우선 실행 
      if (navigationInterceptor) {
        e.preventDefault();
        e.stopPropagation();
        navigationInterceptor(onNavigate);
        return;
      }

      // 타이머가 실행 중이면 확인 모달
      if (isRunning) {
        e.preventDefault();
        e.stopPropagation();
        showNavigationModal(onNavigate);
        return;
      }
      onNavigate();
    },
    [isRunning, showNavigationModal, onNavigate, navigationInterceptor]
  );

  return { handleClick, isRunning };
}
