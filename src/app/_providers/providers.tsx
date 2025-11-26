"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TimerProvider } from "@/app/_contexts/TimerContext";
import dynamic from "next/dynamic";

// NavigationBlocker와 NavigationModal을 동적 import로 분리
const NavigationBlocker = dynamic(() => import("./navigationBlocker"), {
  ssr: false,
});

const NavigationModal = dynamic(() => import("./navigationModal"), {
  ssr: false,
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TimerProvider>
        <NavigationBlocker />
        <NavigationModal />
        {children}
      </TimerProvider>
    </QueryClientProvider>
  );
}
