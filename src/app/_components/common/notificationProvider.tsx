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
import { usePokeNotification } from "@/app/_hooks/usePokeNotification";
import { useCheerNotification } from "@/app/_hooks/useCheerNotification";
import type { CheerNotification } from "@/app/_types/groups";
import { useBrowserNotification } from "@/app/_hooks/useBrowserNotification";
import TimerCompletionModal from "./timerCompletionModal";
import PokeNotificationModal from "./pokeNotificationModal";
import type { FocusNotificationMessage } from "@/app/_hooks/useFocusNotification";
import type { TimerCompletionNotification } from "@/app/_hooks/useTimerCompletionNotification";
import type { PokeNotification } from "@/app/_types/groups";

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
  const [pokeNotification, setPokeNotification] =
    useState<PokeNotification | null>(null);

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

  const handlePokeNotification = useCallback(
    (notification: PokeNotification) => {
      console.log("[NotificationProvider] 콕 찌르기 알림:", notification);

      // 모달 표시
      setPokeNotification(notification);

      // 브라우저 알림도 표시 (선택사항)
      const title = `${notification.fromUserNickname}님이 콕 찌르기를 보냈어요!`;
      const body = notification.message;

      if (permission === "granted") {
        showBrowserNotification(title, {
          body: body,
          icon: "/chorme/notificationIcon.png",
          badge: "/chorme/notificationIcon.png",
          tag: `poke-notification-${notification.groupId}`,
        });
      } else if (permission === "default") {
        requestPermission().then((granted) => {
          if (granted) {
            showBrowserNotification(title, {
              body: body,
              icon: "/chorme/notificationIcon.png",
              badge: "/chorme/notificationIcon.png",
              tag: `poke-notification-${notification.groupId}`,
            });
          }
        });
      }
    },
    [permission, requestPermission, showBrowserNotification]
  );

  const handleClosePokeNotificationModal = useCallback(() => {
    setPokeNotification(null);
  }, []);

  const handleCheerNotification = useCallback(
    (notification: CheerNotification) => {
      console.log("[NotificationProvider] 응원 알림:", notification);

      // 브라우저 알림 표시
      const title = `💪🏻 ${notification.fromUserNickname}님이 응원을 보내셨어요!`;

      if (permission === "granted") {
        console.log("[NotificationProvider] 응원 알림 표시");
        showBrowserNotification(title, {
          icon: "/chorme/cheerupIcon.png",
          badge: "/chorme/cheerupIcon.png",
          tag: `cheer-notification-${notification.groupId}-${notification.fromUserId}`,
        });
      } else if (permission === "default") {
        requestPermission().then((granted) => {
          if (granted) {
            showBrowserNotification(title, {
              icon: "/chorme/cheerupIcon.png",
              badge: "/chorme/cheerupIcon.png",
              tag: `cheer-notification-${notification.groupId}-${notification.fromUserId}`,
            });
          }
        });
      }
    },
    [permission, requestPermission, showBrowserNotification]
  );

  // 집중 체크 알림 구독
  useGlobalFocusNotifications(handleFocusNotification);
  
  // 타이머 완료 알림 구독
  useTimerCompletionNotification({
    enabled: true,
    onNotification: handleTimerCompletionNotification,
  });

  // 콕 찌르기 알림 구독
  usePokeNotification({
    enabled: true,
    onNotification: handlePokeNotification,
  });

  // 응원 알림 구독
  useCheerNotification({
    enabled: true,
    onNotification: handleCheerNotification,
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
      {pokeNotification && (
        <PokeNotificationModal
          notification={pokeNotification}
          onClose={handleClosePokeNotificationModal}
        />
      )}
    </NotificationContext.Provider>
  );
}
