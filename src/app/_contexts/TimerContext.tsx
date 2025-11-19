"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TimerContextType {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <TimerContext.Provider value={{ isRunning, setIsRunning }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error(" TimerProvider");
  }
  return context;
}

