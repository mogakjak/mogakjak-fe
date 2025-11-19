"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TimerContextType {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  hasSelectedTodo: boolean;
  setHasSelectedTodo: (hasTodo: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [hasSelectedTodo, setHasSelectedTodo] = useState(false);

  return (
    <TimerContext.Provider value={{ isRunning, setIsRunning, hasSelectedTodo, setHasSelectedTodo }}>
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

