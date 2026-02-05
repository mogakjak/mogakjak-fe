import { request } from "../request";

export interface OnboardingStatus {
    isFirstVisit: boolean;
}

const USERS_BASE = "/api/users";

export const getOnboardingStatus = async (): Promise<OnboardingStatus> => {
    const response = await request<OnboardingStatus>(USERS_BASE, "/onboarding", {
        method: "POST",
    });
    return response;
};
