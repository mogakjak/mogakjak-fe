"use client";

import { useMutation } from "@tanstack/react-query";

type Provider = "kakao" | "google";

function buildAuthorizeUrl(provider: Provider): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const vercelRedirect = process.env.NEXT_PUBLIC_REDIRECT_URI;

  // 클라이언트 환경에서 현재 origin 확인
  const isBrowser = typeof window !== "undefined";
  const currentOrigin = isBrowser ? window.location.origin : "";
  const isLocalhost = currentOrigin.includes("localhost:3000");

  // 로컬일 때는 명시적으로 localhost 전달, 배포일 때는 redirect_uri 생략
  const redirectUri = isLocalhost ? "http://localhost:3000" : undefined;

  const basePath = `${base}/oauth2/authorization/${provider}`;
  return redirectUri
    ? `${basePath}?redirect_uri=${encodeURIComponent(redirectUri)}`
    : basePath; // 생략 시 서버 기본값(vercel 도메인) 사용
}

/** 소셜 로그인 훅 */
export function useLogin() {
  return useMutation<{ ok: true }, Error, { provider: Provider }>({
    mutationFn: async ({ provider }) => {
      const url = buildAuthorizeUrl(provider);
      if (typeof window !== "undefined") window.location.href = url;
      return { ok: true };
    },
  });
}
