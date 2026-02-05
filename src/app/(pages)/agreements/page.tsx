"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postAgreements } from "@/app/api/users/api";

export default function AgreementsPage() {
    const router = useRouter();
    const [allAgreed, setAllAgreed] = useState(false);
    const [agreements, setAgreements] = useState({
        service: false,
        privacy: false,
        marketing: false, // Optional
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
        <div className="flex flex-col items-center min-h-screen bg-white px-4 py-8 max-w-[480px] mx-auto w-full">
            <header className="w-full flex justify-start mb-8">
                <h1 className="text-h1-24B text-gray-900">약관 동의</h1>
            </header>

            <div className="w-full flex-1 flex flex-col gap-8">
                {/* Agreements Section */}
                <section className="flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer py-2 border-b border-gray-100 pb-4">
                        <input
                            type="checkbox"
                            checked={allAgreed}
                            onChange={handleAllAgree}
                            className="w-5 h-5 rounded-full border-gray-300 unchecked:bg-gray-200 checked:bg-gray-900 accent-gray-900"
                        />
                        <span className="text-body1-16B text-gray-900">전체 동의하기</span>
                    </label>

                    <div className="flex flex-col gap-3 pl-1">
                        <AgreementItem
                            label="(필수) 서비스 이용약관 동의"
                            checked={agreements.service}
                            onChange={() => handleAgreementChange("service")}
                            link="#"
                        />
                        <AgreementItem
                            label="(필수) 개인정보 처리방침 동의"
                            checked={agreements.privacy}
                            onChange={() => handleAgreementChange("privacy")}
                            link="#"
                        />
                        <AgreementItem
                            label="(선택) 마케팅 정보 수신 동의"
                            checked={agreements.marketing}
                            onChange={() => handleAgreementChange("marketing")}
                            link="#"
                        />
                    </div>
                </section>
            </div>

            <div className="w-full mt-8">
                <button
                    onClick={handleSubmit}
                    disabled={!isValid || isSubmitting}
                    className="w-full py-4 rounded-xl bg-gray-900 text-white text-body1-16B disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                >
                    {isSubmitting ? "처리 중..." : "시작하기"}
                </button>
            </div>
        </div>
    );
}

function AgreementItem({ label, checked, onChange, link }: { label: string, checked: boolean, onChange: () => void, link: string }) {
    return (
        <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="w-4 h-4 rounded border-gray-300 accent-gray-900"
                />
                <span className="text-body2-14R text-gray-600">{label}</span>
            </label>
            <button className="text-caption1-12R text-gray-400 underline" onClick={(e) => { e.preventDefault(); /* Open Modal */ }}>
                보기
            </button>
        </div>
    )
}
