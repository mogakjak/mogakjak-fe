"use client";

import { useEffect, useState } from "react";
import Pomodoro from "./pomodoro";

export default function Timer() {
  const total = 60 * 60;
  const [remain, setRemain] = useState(total);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemain((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div>
      <Pomodoro
        totalSeconds={total}
        remainingSeconds={remain}
        size={304}
        color="#FA5332"
      />
    </div>
  );
}
