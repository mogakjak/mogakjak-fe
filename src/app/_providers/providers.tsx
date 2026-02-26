"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TimerProvider } from "@/app/_contexts/TimerContext";
import dynamic from "next/dynamic";
import { AgreementRequiredError } from "@/app/api/errors/AgreementRequiredError";
import { DeactivatedUserError } from "@/app/api/errors/DeactivatedUserError";
import { invalidateTokenCache } from "@/app/api/auth/api";

// NavigationBlocker와 NavigationModal을 동적 import로 분리
const NavigationBlocker = dynamic(() => import("./navigationBlocker"), {
  ssr: false,
});

const NavigationModal = dynamic(() => import("./navigationModal"), {
  ssr: false,
});

const InviteRedirectHandler = dynamic(
  () => import("./inviteRedirectHandler"),
  { ssr: false }
);

// 모듈 레벨 플래그로 무한 리다이렉트 방지
let isRedirecting = false;

// sessionStorage 키로 리다이렉트 상태 관리
const DEACTIVATED_REDIRECT_KEY = "deactivated_redirect";

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

//탈퇴 유저 리다이렉트
async function handleDeactivatedUserRedirect(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (sessionStorage.getItem(DEACTIVATED_REDIRECT_KEY) === "true") {
    return;
  }
  sessionStorage.setItem(DEACTIVATED_REDIRECT_KEY, "true");
  invalidateTokenCache();
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });
    await response.text();
  } catch {
  }

  const loginUrl = new URL("/login", window.location.origin);
  loginUrl.searchParams.set("deactivated", "true");
  
  await new Promise((resolve) => setTimeout(resolve, 100));

  window.location.replace(loginUrl.toString());
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
  if (event?.type === "updated") {
    const error = event.query.state.error;
    if (error instanceof AgreementRequiredError) {
      handleAgreementRedirect(error);
    } else if (error instanceof DeactivatedUserError) {
      handleDeactivatedUserRedirect().catch(() => { 
      });
    }
  }
});

// Mutation Cache에 전역 에러 핸들러 등록
queryClient.getMutationCache().subscribe((event) => {
  if (event?.type === "updated") {
    const error = event.mutation.state.error;
    if (error instanceof AgreementRequiredError) {
      handleAgreementRedirect(error);
    } else if (error instanceof DeactivatedUserError) {
      handleDeactivatedUserRedirect().catch(() => {
        // 에러 발생 시에도 계속 진행
      });
    }
  }
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TimerProvider>
        <NavigationBlocker />
        <NavigationModal />
        <InviteRedirectHandler />
        {children}
      </TimerProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
