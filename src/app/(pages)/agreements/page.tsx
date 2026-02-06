"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postAgreements } from "@/app/api/users/api";
import AgreementComponent from "./components/AgreementComponent";

export default function AgreementsPage() {
    const router = useRouter();
    const [allAgreed, setAllAgreed] = useState(false);
    const [agreements, setAgreements] = useState({
        service: false,
        privacy: false,
        marketing: false, 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAllAgree = () => {
        const newState = !allAgreed;
        setAllAgreed(newState);
        setAgreements({
            service: newState,
            privacy: newState,
            marketing: newState,
        });
    };

    const handleAgreementChange = (key: keyof typeof agreements) => {
        const newState = { ...agreements, [key]: !agreements[key] };
        setAgreements(newState);
        setAllAgreed(Object.values(newState).every(Boolean));
    };

    const handleSubmit = async () => {
        if (!agreements.service || !agreements.privacy) return;

        setIsSubmitting(true);
        try {
            await postAgreements({
                agreements,
            });

            // Success -> redirect to onboarding
            router.replace("/onboarding");
        } catch (error) {
            console.error("Agreement submission failed", error);
            alert("처리에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = agreements.service && agreements.privacy;

    return (
        <AgreementComponent
            allAgreed={allAgreed}
            agreements={agreements}
            isValid={isValid}
            isSubmitting={isSubmitting}
            onAllAgree={handleAllAgree}
            onAgreementChange={handleAgreementChange}
            onSubmit={handleSubmit}
        />
    );
}
