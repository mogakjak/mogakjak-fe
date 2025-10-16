"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/app/_api/auth/useAuthState";

export default function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, ready } = useAuthState(); //준비 완료 여부까지 사용

  useEffect(() => {
    if (!ready) return; // 아직 판단 중이면 아무 것도 하지 않음
    if (!isLoggedIn) router.replace("/login");
  }, [ready, isLoggedIn, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-body1-16M text-gray-600">Loading ...</p>
      </div>
    );
  }

  return <>{children}</>;
}
