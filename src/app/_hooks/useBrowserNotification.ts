"use client";

import { useCallback, useEffect, useState } from "react";

type NotificationPermission = "default" | "granted" | "denied";

export function useBrowserNotification() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn("Notification API를 지원하지 않는 브라우저입니다.");
      return false;
    }

    if (Notification.permission === "granted") {
      setPermission("granted");
      return true;
    }

    if (Notification.permission === "denied") {
      setPermission("denied");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("알림 권한 요청 실패:", error);
      return false;
    }
  }, [isSupported]);
  const showNotification = useCallback(
    (
      title: string,
      options?: NotificationOptions
    ): Notification | null => {
      if (!isSupported) {
        console.warn("Notification API를 지원하지 않는 브라우저입니다.");
        return null;
      }

      if (Notification.permission !== "granted") {
        console.warn("알림 권한이 없습니다. 먼저 권한을 요청해주세요.");
        return null;
      }

      try {
        const getIconUrl = (iconPath?: string): string | undefined => {
          if (!iconPath) return undefined;
          
          if (iconPath.startsWith("/")) {
            return `${window.location.origin}${iconPath}`;
          }
          return iconPath;
        };

        const iconUrl = getIconUrl(options?.icon) || `${window.location.origin}/thumbnail.png`;
        const badgeUrl = getIconUrl(options?.badge) || `${window.location.origin}/thumbnail.png`;

        let notification: Notification | null = null;
        try {
          notification = new Notification(title, {
            icon: iconUrl,
            badge: badgeUrl,
            tag: options?.tag || "focus-notification", 
            requireInteraction: false,
            silent: false, 
            body: options?.body,
            data: options?.data,
            dir: options?.dir,
            lang: options?.lang,
          });

          notification.onclick = () => {
            window.focus();
            notification?.close();
          };

          notification.onerror = (error) => {
            console.error("[Notification] 알림 에러 발생:", error);
          };

          setTimeout(() => {
            if (notification) {
              notification.close();
            }
          }, 5000);
        } catch (error) {
          console.error("[Notification] 알림 생성 중 에러 발생:", error);
          return null;
        }

        return notification;
      } catch (error) {
        console.error("알림 표시 실패:", error);
        return null;
      }
    },
    [isSupported]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
  };
}

