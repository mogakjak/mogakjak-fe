"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TimerProvider } from "@/app/_contexts/TimerContext";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TimerProvider>{children}</TimerProvider>
    </QueryClientProvider>
  );
}
