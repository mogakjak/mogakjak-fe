"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import { useGlobalFocusNotifications } from "@/app/_hooks/useGlobalFocusNotifications";
import { useBrowserNotification } from "@/app/_hooks/useBrowserNotification";
import type { FocusNotificationMessage } from "@/app/_hooks/useFocusNotification";

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

  const handleNotification = useCallback(
    (message: FocusNotificationMessage) => {
      console.log("[NotificationProvider] handleNotification called:", message);
      console.log("[NotificationProvider] Permission status:", permission);
      console.log("[NotificationProvider] Is supported:", isSupported);
      
      if (permission === "granted") {
        console.log("[NotificationProvider] Permission granted, showing notification");
        showBrowserNotification(message.groupName || "모각작", {
          body: message.message,
          icon: "/chorme/notificationIcon.png",
          badge: "/chorme/notificationIcon.png",
          tag: `focus-notification-${message.groupId}`, 
        });
      } else if (permission === "default") {
        console.log("[NotificationProvider] Permission default, requesting permission");
        requestPermission().then((granted) => {
          console.log("[NotificationProvider] Permission request result:", granted);
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
        console.warn("[NotificationProvider] Permission denied, cannot show notification");
      }
    },
    [permission, requestPermission, showBrowserNotification, isSupported]
  );

  useGlobalFocusNotifications(handleNotification);

  return (
    <NotificationContext.Provider
      value={{
        showNotification: handleNotification,
        requestNotificationPermission: requestPermission,
        notificationPermission: permission,
        isNotificationSupported: isSupported,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

