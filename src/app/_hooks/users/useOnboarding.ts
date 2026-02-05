"use client";

import { useQuery } from "@tanstack/react-query";
import { getOnboardingStatus } from "@/app/api/users/api";

export const useOnboarding = () => {
    return useQuery({
        queryKey: ["onboarding-status"],
        queryFn: async () => {
            return await getOnboardingStatus();
        },
        staleTime: Infinity,
        gcTime: Infinity,
    });
};
