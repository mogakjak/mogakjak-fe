"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ACCESS_TOKEN_KEY = "mg_access_token";
const REFRESH_TOKEN_KEY = "mg_refresh_token";

export default function OAuthCallback() {
  const sp = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = sp.get("accessToken");
    const refreshToken = sp.get("refreshToken");
    const loginSuccess = sp.get("loginSuccess"); // "true" | "false" | null
    const next = sp.get("next") || "/";

    // 실패 플래그가 오면 에러로 이동
    if (loginSuccess === "false") {
      router.replace("/login?error=oauth_failed");
      return;
    }

    // 토큰이 있으면 저장 (임시: 로컬스토리지)
    if (accessToken) {
      try {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

        // 다른 탭 동기화를 위해 storage 이벤트 트리거 (선택)
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: ACCESS_TOKEN_KEY,
            newValue: accessToken,
          })
        );
      } catch {}
    } else {
      // 토큰이 없으면 에러 처리
      router.replace("/login?error=missing_token");
      return;
    }

    // 완료 후 이동
    router.replace(next);
  }, [sp, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-body1-16M text-gray-600"></p>
    </div>
  );
}
