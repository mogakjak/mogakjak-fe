"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ACCESS_TOKEN_KEY = "mg_access_token";
const REFRESH_TOKEN_KEY = "mg_refresh_token";

export default function OAuthCallbackInner() {
  const sp = useSearchParams(); //Suspense 경계 안에서 사용
  const router = useRouter();
  const handled = useRef(false); // StrictMode 이펙트 2회 방지

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const accessToken = sp.get("accessToken");
    const refreshToken = sp.get("refreshToken");
    const loginSuccess = sp.get("loginSuccess"); // "true" | "false" | null
    const rawNext = sp.get("next") || "/";

    // 오픈 리다이렉트 방지: 내부 경로만 허용
    const next = rawNext.startsWith("/") ? rawNext : "/";

    if (loginSuccess === "false") {
      router.replace("/login?error=oauth_failed");
      return;
    }

    if (!accessToken) {
      router.replace("/login?error=missing_token");
      return;
    }

    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

      // 다른 탭 동기화 (선택)
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: ACCESS_TOKEN_KEY,
          newValue: accessToken,
        })
      );
    } catch {
      router.replace("/login?error=storage_failed");
      return;
    }

    router.replace(next);
  }, [sp, router]);

  return null;
}
