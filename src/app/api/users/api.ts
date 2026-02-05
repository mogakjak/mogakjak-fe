import { request } from "../request";
import type { OnboardingStatus, AgreementData } from "@/app/_types/users";

const USERS_BASE = "/api/users";

export const getOnboardingStatus = async (): Promise<OnboardingStatus> => {
    const response = await request<OnboardingStatus>(USERS_BASE, "/onboarding", {
        method: "POST",
    });
    return response;
};

export const postAgreements = async (data: AgreementData): Promise<void> => {
    const { service, privacy, marketing } = data.agreements;

    await request(USERS_BASE, "/agreements", {
        method: "POST",
        body: JSON.stringify({
            termsAgreed: service,
            privacyAgreed: privacy,
            marketingAgreed: marketing
        }),
    });
};
