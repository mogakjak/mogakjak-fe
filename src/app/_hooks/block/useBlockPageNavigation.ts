import { useEffect } from "react";
import { useTimer } from "@/app/_contexts/TimerContext";

export function useBlockPageNavigation() {
  const { isRunning, setIsRunning } = useTimer();

  useEffect(() => {
    if (typeof window === "undefined" || !isRunning) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();

      fetch("/api/timers/finish/active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        keepalive: true,
        credentials: "include",
      }).catch(() => {});
    };

    const handlePopState = async (e: PopStateEvent) => {
      if (isRunning) {
        e.preventDefault();

        window.history.pushState(null, "", window.location.href);

        try {
          await fetch("/api/timers/finish/active", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          setIsRunning(false);
        } catch (error) {
          console.error("타이머 강제 종료 실패:", error);
          setIsRunning(false);
        }
        window.history.back();
      }
    };

    window.history.pushState(null, "", window.location.href);

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isRunning, setIsRunning]);
}
