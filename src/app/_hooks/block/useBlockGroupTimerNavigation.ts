import { useEffect } from "react";
import { useTimer } from "@/app/_contexts/TimerContext";
import { finishGroupTimer } from "@/app/api/timers/api";

export function useBlockGroupTimerNavigation(
  groupId: string,
  sessionId: string | null,
  isRunning: boolean
) {
  const { setIsRunning, showNavigationModal } = useTimer();

  useEffect(() => {
    if (typeof window === "undefined" || !isRunning || !sessionId) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();

      fetch(`/api/timers/groups/${groupId}/finish/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        keepalive: true,
        credentials: "include",
      }).catch(() => {});
    };

    const handlePopState = (e: PopStateEvent) => {
      if (isRunning && sessionId) {
        e.preventDefault();
            
        window.history.pushState(null, "", window.location.href);
        showNavigationModal(async () => {
          try {
            await finishGroupTimer(groupId, sessionId);
            setIsRunning(false);
          } catch (error) {
            console.error("그룹 타이머 강제 종료 실패:", error);
            setIsRunning(false);
          }
          window.history.back();
        });
      }
    };

    window.history.pushState(null, "", window.location.href);

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isRunning, sessionId, groupId, setIsRunning, showNavigationModal]);
}

