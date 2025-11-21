"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TimerProvider } from "@/app/_contexts/TimerContext";
import { NotificationProvider } from "@/app/_components/common/notificationProvider";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TimerProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </TimerProvider>
    </QueryClientProvider>
  );
}
