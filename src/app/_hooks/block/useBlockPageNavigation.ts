import { useEffect } from "react";
import { useTimer } from "@/app/_contexts/TimerContext";

export function useBlockPageNavigation() {
  const { isRunning, setIsRunning, showNavigationModal } = useTimer();

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

    const handlePopState = (e: PopStateEvent) => {
      if (isRunning) {
        e.preventDefault();

        // 히스토리 상태를 복원하여 뒤로가기를 취소
        window.history.pushState(null, "", window.location.href);

        // 확인 모달을 띄우고, 사용자가 확인하면 타이머를 종료하고 뒤로가기 실행
        showNavigationModal(async () => {
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
  }, [isRunning, setIsRunning, showNavigationModal]);
}
