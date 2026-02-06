"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TimerProvider } from "@/app/_contexts/TimerContext";
import dynamic from "next/dynamic";
import { AgreementRequiredError } from "@/app/api/errors/AgreementRequiredError";

// NavigationBlocker와 NavigationModal을 동적 import로 분리
const NavigationBlocker = dynamic(() => import("./navigationBlocker"), {
  ssr: false,
});

const NavigationModal = dynamic(() => import("./navigationModal"), {
  ssr: false,
});

// 모듈 레벨 플래그로 무한 리다이렉트 방지
let isRedirecting = false;

/**
 * 약관 동의 필요 시 리다이렉트 처리
 */
function handleAgreementRedirect(error: AgreementRequiredError): void {
  if (typeof window === "undefined") {
    return; // 서버 사이드에서는 처리하지 않음
  }

  if (isRedirecting) {
    return; // 이미 리다이렉트 진행 중이면 무시
  }

  const currentPath = window.location.pathname;

  // 이미 해당 페이지에 있으면 무시
  if (
    (error.hasToken && currentPath === "/agreements") ||
    (!error.hasToken && currentPath === "/login")
  ) {
    return;
  }

  // 리다이렉트 플래그 설정
  isRedirecting = true;

  // 리다이렉트 실행
  if (error.hasToken) {
    window.location.replace("/agreements");
  } else {
    window.location.replace("/login");
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Query Cache에 전역 에러 핸들러 등록
queryClient.getQueryCache().subscribe((event) => {
  if (event?.type === "error" && event.error instanceof AgreementRequiredError) {
    handleAgreementRedirect(event.error);
  }
});

// Mutation Cache에 전역 에러 핸들러 등록
queryClient.getMutationCache().subscribe((event) => {
  if (event?.type === "error" && event.error instanceof AgreementRequiredError) {
    handleAgreementRedirect(event.error);
  }
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TimerProvider>
        <NavigationBlocker />
        <NavigationModal />
        {children}
      </TimerProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
