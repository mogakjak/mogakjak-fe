"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

type PendingNavigationAction = {
  onConfirm: () => void | Promise<void>;
} | null;

interface TimerContextType {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  hasSelectedTodo: boolean;
  setHasSelectedTodo: (hasTodo: boolean) => void;
  pendingNavigation: PendingNavigationAction;
  showNavigationModal: (onConfirm: () => void | Promise<void>) => void;
  closeNavigationModal: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [hasSelectedTodo, setHasSelectedTodo] = useState(false);
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigationAction>(null);

  const showNavigationModal = useCallback(
    (onConfirm: () => void | Promise<void>) => {
      setPendingNavigation({ onConfirm });
    },
    []
  );

  const closeNavigationModal = useCallback(() => {
    setPendingNavigation(null);
  }, []);

  return (
    <TimerContext.Provider
      value={{
        isRunning,
        setIsRunning,
        hasSelectedTodo,
        setHasSelectedTodo,
        pendingNavigation,
        showNavigationModal,
        closeNavigationModal,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}

