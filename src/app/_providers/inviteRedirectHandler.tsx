"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function InviteRedirectHandler() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname !== "/") return;

    // 온보딩을 아직 완료하지 않은 사용자는 리다이렉트하지 않음
    // (온보딩 완료 시 handleFinalModalClose에서 처리됨)
    const isOnboardingDone =
      window.localStorage.getItem("mg_onboarded_v1") === "true";
    if (!isOnboardingDone) return;

    const inviteGroupId = sessionStorage.getItem("mg_invite_groupid");
    if (inviteGroupId) {
      sessionStorage.removeItem("mg_invite_groupid");
      router.replace(`/invite/${inviteGroupId}`);
    }
  }, [pathname, router]);

  return null;
}

