"use client";

import React from "react";

interface GuideModalProps {
    currentStep: number;
    steps: string[];
}

export default function GuideModal({
    currentStep,
    steps,
}: GuideModalProps) {
    // 1-5단계: 1/2, 6단계 이상: 2/2
    const displayStep = currentStep <= 4 ? 1 : 2;

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <div className="relative w-[360px] rounded-[24px] bg-white px-5 py-10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                <h2 className="mb-8 text-center text-body1-16SB text-gray-900">
                    모각작 둘러보기 ({displayStep}/{steps.length})
                </h2>

                <div className="flex flex-col gap-2">
                    {steps.map((step, idx) => {
                        const stepNumber = idx + 1;
                        const isActive =
                            (stepNumber === 1 && currentStep <= 4) ||
                            (stepNumber === 2 && currentStep >= 5);

                        return (
                            <div
                                key={stepNumber}
                                className={`w-full rounded-[8px] px-4 py-2 text-center text-body2-14M transition 
                  ${isActive
                                        ? "bg-[#FFECE6] text-[#FF6B4A] font-semibold"
                                        : "text-gray-800"
                                    }`}
                            >
                                {stepNumber}. {step}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
