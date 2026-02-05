"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useOnboarding } from "./useOnboarding";

export const useOnboardingRedirect = () => {
    const router = useRouter();
    const { data: onboarding, isLoading } = useOnboarding();

    const isFirstVisit = onboarding?.isFirstVisit;

    useEffect(() => {
        const isLocalOnboardingDone =
            typeof window !== "undefined" &&
            window.localStorage.getItem("mg_onboarded_v1") === "true";

        if (isFirstVisit && !isLocalOnboardingDone) {
            router.push("/onboarding");
        }
    }, [isFirstVisit, router]);

    // 온보딩 체크 중이거나 첫 방문인 경우 화면을 그리지 않음 (리다이렉트 대기)
    const shouldRender = !isFirstVisit;

    return { isFirstVisit, shouldRender, isLoading };
};
