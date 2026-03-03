"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useOnboarding } from "./useOnboarding";

export const useOnboardingRedirect = () => {
    const router = useRouter();
    const { data: onboarding, isLoading } = useOnboarding();

    const isFirstVisit = onboarding?.isFirstVisit;

    // localStorage의 온보딩 완료 플래그를 state로 관리
    const [isLocalOnboardingDone, setIsLocalOnboardingDone] = useState(false);

    useEffect(() => {
        const done =
            typeof window !== "undefined" &&
            window.localStorage.getItem("mg_onboarded_v1") === "true";
        setIsLocalOnboardingDone(done);
    }, []);

    useEffect(() => {
        if (isFirstVisit && !isLocalOnboardingDone) {
            router.push("/onboarding");
        }
    }, [isFirstVisit, isLocalOnboardingDone, router]);

    // 서버에서 isFirstVisit이어도, 로컬에서 온보딩 완료했으면 홈을 렌더링
    const shouldRender = !isFirstVisit || isLocalOnboardingDone;

    return { isFirstVisit, shouldRender, isLoading };
};
