"use client";

import { useMutation } from "@tanstack/react-query";

type Provider = "kakao" | "google";

function required(name: string, val?: string) {
  if (!val) throw new Error(`Missing env: ${name}`);
  return val;
}
function stripSlash(s: string) {
  return s.replace(/\/+$/, "");
}

function buildAuthorizeUrl(provider: Provider): string {
  const rawBase = required(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL
  );
  const apiBase = stripSlash(rawBase);

  // 실행 환경에 따라 안전하게 origin을 계산 (브라우저 우선)
  const runtimeOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_ORIGIN ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");

  // 우선순위: NEXT_PUBLIC_REDIRECT_URI(있으면 그대로) > runtimeOrigin
  // 백엔드가 콜백 경로를 자동으로 붙이는 환경이라면 호스트만 전달되도록 한다
  let redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI
    ? stripSlash(process.env.NEXT_PUBLIC_REDIRECT_URI)
    : stripSlash(runtimeOrigin);

  // 로컬 개발 환경에서 콜백을 항상 localhost:3000으로 고정
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocalHostLike =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0";
    if (isLocalHostLike) {
      redirectUri = "http://localhost:3000";
    }
  } else if (process.env.NODE_ENV === "development") {
    redirectUri = "http://localhost:3000";
  }

  const url = new URL(`/oauth2/authorization/${provider}`, apiBase);

  if (!redirectUri) {
    throw new Error(
      "Missing redirect URI: cannot compute origin or env fallback"
    );
  }
  url.searchParams.set("redirect_uri", redirectUri);

  return url.toString();
}

/** 소셜 로그인 훅 */
export function useLogin() {
  return useMutation<{ ok: true }, Error, { provider: Provider }>({
    mutationFn: async ({ provider }) => {
      const href = buildAuthorizeUrl(provider);
      if (typeof window !== "undefined") window.location.href = href;
      return { ok: true };
    },
  });
}
