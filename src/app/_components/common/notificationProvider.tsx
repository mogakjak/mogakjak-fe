"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { useGlobalFocusNotifications } from "@/app/_hooks/useGlobalFocusNotifications";
import { useTimerCompletionNotification } from "@/app/_hooks/useTimerCompletionNotification";
import { useBrowserNotification } from "@/app/_hooks/useBrowserNotification";
import TimerCompletionModal from "./timerCompletionModal";
import type { FocusNotificationMessage } from "@/app/_hooks/useFocusNotification";
import type { TimerCompletionNotification } from "@/app/_hooks/useTimerCompletionNotification";

type NotificationContextType = {
  showNotification: (message: FocusNotificationMessage) => void;
  requestNotificationPermission: () => Promise<boolean>;
  notificationPermission: "default" | "granted" | "denied";
  isNotificationSupported: boolean;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const {
    isSupported,
    permission,
    requestPermission,
    showNotification: showBrowserNotification,
  } = useBrowserNotification();

  const [timerCompletionNotification, setTimerCompletionNotification] =
    useState<TimerCompletionNotification | null>(null);

  const handleFocusNotification = useCallback(
    (message: FocusNotificationMessage) => {
      console.log("[NotificationProvider] 집중 체크 알림:", message);
      console.log("[NotificationProvider] Permission status:", permission);
      console.log("[NotificationProvider] Is supported:", isSupported);

      if (permission === "granted") {
        console.log(
          "[NotificationProvider] Permission granted, showing notification"
        );
        showBrowserNotification(message.groupName || "모각작", {
          body: message.message,
          icon: "/chorme/notificationIcon.png",
          badge: "/chorme/notificationIcon.png",
          tag: `focus-notification-${message.groupId}`,
        });
      } else if (permission === "default") {
        console.log(
          "[NotificationProvider] Permission default, requesting permission"
        );
        requestPermission().then((granted) => {
          console.log(
            "[NotificationProvider] Permission request result:",
            granted
          );
          if (granted) {
            showBrowserNotification(message.groupName || "모각작", {
              body: message.message,
              icon: "/chorme/notificationIcon.png",
              badge: "/chorme/notificationIcon.png",
              tag: `focus-notification-${message.groupId}`,
            });
          } else {
            console.warn("[NotificationProvider] Permission denied by user");
          }
        });
      } else {
        console.warn(
          "[NotificationProvider] Permission denied, cannot show notification"
        );
      }
    },
    [permission, requestPermission, showBrowserNotification, isSupported]
  );

  const handleTimerCompletionNotification = useCallback(
    (notification: TimerCompletionNotification) => {
      console.log("[NotificationProvider] 타이머 완료 알림:", notification);

      // 모달 표시
      setTimerCompletionNotification(notification);

      // 브라우저 알림도 표시
      const title = notification.todoTitle
        ? `"${notification.todoTitle}" 타이머 완료!`
        : "타이머 완료!";

      const body = notification.message || "설정한 시간이 완료되었습니다.";

      if (permission === "granted") {
        console.log("[NotificationProvider] 타이머 완료 알림 표시");
        showBrowserNotification(title, {
          body: body,
          icon: "/chorme/notificationIcon.png",
          badge: "/chorme/notificationIcon.png",
          tag: `timer-completion-${notification.sessionId}`,
        });
      } else if (permission === "default") {
        requestPermission().then((granted) => {
          if (granted) {
            showBrowserNotification(title, {
              body: body,
              icon: "/chorme/notificationIcon.png",
              badge: "/chorme/notificationIcon.png",
              tag: `timer-completion-${notification.sessionId}`,
            });
          }
        });
      }
    },
    [permission, requestPermission, showBrowserNotification]
  );

  const handleCloseTimerCompletionModal = useCallback(() => {
    setTimerCompletionNotification(null);
  }, []);

  // 집중 체크 알림 구독
  useGlobalFocusNotifications(handleFocusNotification);

  // 타이머 완료 알림 구독
  useTimerCompletionNotification({
    enabled: true,
    onNotification: handleTimerCompletionNotification,
  });

  return (
    <NotificationContext.Provider
      value={{
        showNotification: handleFocusNotification,
        requestNotificationPermission: requestPermission,
        notificationPermission: permission,
        isNotificationSupported: isSupported,
      }}
    >
      {children}
      {timerCompletionNotification && (
        <TimerCompletionModal
          notification={timerCompletionNotification}
          onClose={handleCloseTimerCompletionModal}
        />
      )}
    </NotificationContext.Provider>
  );
}
