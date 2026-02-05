export interface OnboardingStatus {
    isFirstVisit: boolean;
}

export interface AgreementData {
    agreements: {
        service: boolean;
        privacy: boolean;
        marketing: boolean;
    };
}
