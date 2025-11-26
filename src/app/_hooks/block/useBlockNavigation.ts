import { useCallback } from "react";
import { useTimer } from "@/app/_contexts/TimerContext";

export function useBlockNavigation(onNavigate: () => void | Promise<void>): {
  handleClick: (e: React.MouseEvent<HTMLElement>) => void;
  isRunning: boolean;
} {
  const { isRunning, showNavigationModal } = useTimer();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isRunning) {
        e.preventDefault();
        e.stopPropagation();
        showNavigationModal(onNavigate);
        return;
      }
      onNavigate();
    },
    [isRunning, showNavigationModal, onNavigate]
  );

  return { handleClick, isRunning };
}
