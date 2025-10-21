"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // URL 파라미터에서 토큰을 추출
    const accessToken =
      searchParams.get("accessToken") || searchParams.get("access_token");
    const refreshToken =
      searchParams.get("refreshToken") || searchParams.get("refresh_token");

    if (accessToken && refreshToken) {
      // 토큰이 있으면 localStorage에 저장하고 홈으로 리다이렉트
      localStorage.setItem("mg_access_token", accessToken);
      localStorage.setItem("mg_refresh_token", refreshToken);
      router.push("/");
    } else {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      router.push("/login?error=missing_token");
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-body1-16R text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}
