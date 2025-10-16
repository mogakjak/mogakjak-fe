"use client";

import { useMutation } from "@tanstack/react-query";

type Provider = "kakao" | "google";

function buildAuthorizeUrl(provider: Provider): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const vercelRedirect = process.env.NEXT_PUBLIC_REDIRECT_URI;

  const isBrowser = typeof window !== "undefined";
  const currentOrigin = isBrowser ? window.location.origin : "";
  const isLocalhost = currentOrigin.includes("localhost:3000");

  // 환경에 따라 redirect_uri 선택
  const redirectUri = isLocalhost ? "http://localhost:3000" : vercelRedirect; // 배포 시 .env 값 사용

  const basePath = `${base}/oauth2/authorization/${provider}`;
  return `${basePath}?redirect_uri=${encodeURIComponent(redirectUri!)}`;
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
