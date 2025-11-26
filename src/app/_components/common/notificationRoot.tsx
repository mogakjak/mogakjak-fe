"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// NotificationProvider를 동적 import로 로드 - hydration 이후에만 로드
const NotificationProvider = dynamic(
  () =>
    import("./notificationProvider").then((mod) => ({
      default: mod.NotificationProvider,
    })),
  { ssr: false }
);

export default function NotificationRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <NotificationProvider>{children}</NotificationProvider>;
}
