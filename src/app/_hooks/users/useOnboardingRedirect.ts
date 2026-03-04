"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useOnboarding } from "./useOnboarding";

const getLocalOnboardingDone = () =>
    typeof window !== "undefined" &&
    window.localStorage.getItem("mg_onboarded_v1") === "true";

export const useOnboardingRedirect = () => {
    const router = useRouter();
    const { data: onboarding, isLoading } = useOnboarding();

    const isFirstVisit = onboarding?.isFirstVisit;

    const isLocalOnboardingDone = getLocalOnboardingDone();

    useEffect(() => {
        if (isFirstVisit && !isLocalOnboardingDone) {
            router.push("/onboarding");
        }
    }, [isFirstVisit, isLocalOnboardingDone, router]);

    const shouldRender = !isFirstVisit || isLocalOnboardingDone;

    return { isFirstVisit, shouldRender, isLoading };
};
