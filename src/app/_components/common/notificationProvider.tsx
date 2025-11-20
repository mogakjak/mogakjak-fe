"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import NotificationToast from "./notificationToast";
import { useGlobalFocusNotifications } from "@/app/_hooks/useGlobalFocusNotifications";
import type { FocusNotificationMessage } from "@/app/_hooks/useFocusNotification";

type NotificationContextType = {
  showNotification: (message: FocusNotificationMessage) => void;
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

type NotificationItem = {
  id: string;
  message: FocusNotificationMessage;
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showNotification = useCallback((message: FocusNotificationMessage) => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotifications((prev) => [...prev, { id, message }]);
  }, []);

  // 전역 웹소켓 연결 및 모든 그룹 알림 구독
  useGlobalFocusNotifications(showNotification);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          message={notification.message.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
}

