"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { useGlobalFocusNotifications } from "@/app/_hooks/_websocket/notifications/useGlobalFocusNotifications";
import { useTimerCompletionNotification } from "@/app/_hooks/_websocket/notifications/useTimerCompletionNotification";
import { usePokeNotification } from "@/app/_hooks/_websocket/notifications/usePokeNotification";
import { useCheerNotification } from "@/app/_hooks/_websocket/notifications/useCheerNotification";
import { useBrowserNotification } from "@/app/_hooks/_websocket/notifications/useBrowserNotification";
import TimerCompletionModal from "./timerCompletionModal";
import PokeNotificationModal from "./pokeNotificationModal";
import CheerNotificationModal from "./cheerNotificationModal";
import type { FocusNotificationMessage } from "@/app/_hooks/_websocket/notifications/useFocusNotification";
import type { TimerCompletionNotification } from "@/app/_hooks/_websocket/notifications/useTimerCompletionNotification";
import type { PokeNotification, CheerNotification } from "@/app/_types/groups";
import { sendGAEvent } from "@next/third-parties/google";

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
  const [cheerNotification, setCheerNotification] =
    useState<CheerNotification | null>(null);

  const handleFocusNotification = useCallback(
    (message: FocusNotificationMessage) => {
      if (permission === "granted") {
        showBrowserNotification(message.groupName || "모각작", {
          body: message.message,
          icon: "/chorme/notificationIcon.png",
          badge: "/chorme/notificationIcon.png",
          tag: `focus-notification-${message.groupId}`,
        });
      } else if (permission === "default") {
        requestPermission().then((granted) => {
          if (granted) {
            showBrowserNotification(message.groupName || "모각작", {
              body: message.message,
              icon: "/chorme/notificationIcon.png",
              badge: "/chorme/notificationIcon.png",
              tag: `focus-notification-${message.groupId}`,
            });
          }
        });
      }
    },
    [permission, requestPermission, showBrowserNotification]
  );

  const handleTimerCompletionNotification = useCallback(
    (notification: TimerCompletionNotification) => {
      setTimerCompletionNotification(notification);

      const title = notification.todoTitle
        ? `"${notification.todoTitle}" 타이머 완료!`
        : "타이머 완료!";

      const body = notification.message || "설정한 시간이 완료되었습니다.";

      if (permission === "granted") {
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
      setPokeNotification(notification);

      const title = `${notification.fromUserNickname}님이 콕 찔렀어요!`;
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
    sendGAEvent("event", "poke_response", {
      action: "reject",
    });
    setPokeNotification(null);
  }, []);

  const handleCheerNotification = useCallback(
    (notification: CheerNotification) => {
      // 모달 표시
      setCheerNotification(notification);

      // 브라우저 알림도 표시 (선택사항)
      const title = `${notification.fromUserNickname}님이 응원을 보냈어요!`;
      const body = notification.message;

      if (permission === "granted") {
        showBrowserNotification(title, {
          body: body,
          icon: "/chorme/notificationIcon.png",
          badge: "/chorme/notificationIcon.png",
          tag: `cheer-notification-${notification.groupId}`,
        });
      } else if (permission === "default") {
        requestPermission().then((granted) => {
          if (granted) {
            showBrowserNotification(title, {
              body: body,
              icon: "/chorme/notificationIcon.png",
              badge: "/chorme/notificationIcon.png",
              tag: `cheer-notification-${notification.groupId}`,
            });
          }
        });
      }
    },
    [permission, requestPermission, showBrowserNotification]
  );

  const handleCloseCheerNotificationModal = useCallback(() => {
    setCheerNotification(null);
  }, []);

  // 집중 체크 알림 구독 - LCP 이후에 연결
  useGlobalFocusNotifications(handleFocusNotification, {
    enabled: true,
  });

  // 타이머 완료 알림 - LCP 이후에 연결 (window load 이후)
  useTimerCompletionNotification({
    enabled: true,
    onNotification: handleTimerCompletionNotification,
    connectDelay: 1000, // LCP 이후 1초 추가 지연
    waitForLoad: true,
  });

  // 콕 찌르기 알림 - LCP 이후에 연결 (window load 이후)
  usePokeNotification({
    enabled: true,
    onNotification: handlePokeNotification,
    connectDelay: 1000,
    waitForLoad: true,
  });

  // 응원 알림 구독 - LCP 이후에 연결 (window load 이후)
  useCheerNotification({
    enabled: true,
    onNotification: handleCheerNotification,
    connectDelay: 1000,
    waitForLoad: true,
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
      {cheerNotification && (
        <CheerNotificationModal
          notification={cheerNotification}
          onClose={handleCloseCheerNotificationModal}
        />
      )}
    </NotificationContext.Provider>
  );
}
