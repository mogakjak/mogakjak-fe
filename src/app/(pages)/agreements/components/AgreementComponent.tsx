"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AgreementDetailModal from "./AgreementDetailModal";

interface AgreementComponentProps {
    allAgreed: boolean;
    agreements: {
        service: boolean;
        privacy: boolean;
        marketing: boolean;
    };
    isValid: boolean;
    isSubmitting: boolean;
    onAllAgree: () => void;
    onAgreementChange: (key: "service" | "privacy" | "marketing") => void;
    onSubmit: () => void;
}

export default function AgreementComponent({
    allAgreed,
    agreements,
    isValid,
    isSubmitting,
    onAllAgree,
    onAgreementChange,
    onSubmit,
}: AgreementComponentProps) {
    const router = useRouter();
    const [detailModalType, setDetailModalType] = useState<"service" | "privacy" | null>(null);

    return (
        <>
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="w-[516px] h-[660px] p-6 bg-neutral-50 rounded-[20px] shadow-[0px_0px_28px_0px_rgba(0,0,0,0.15)] inline-flex flex-col justify-start items-center gap-5 overflow-hidden">
                <div className="self-stretch inline-flex justify-end items-center gap-2.5">
                    <button
                        onClick={() => router.back()}
                        className="w-6 h-6 relative overflow-hidden"
                        aria-label="닫기"
                    >
                        <Image src="/Icons/xmark.svg" alt="닫기" width={24} height={24} />
                    </button>
                </div>

                <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-10">
                    <div className="inline-flex justify-start items-center gap-4">
                        <div className="w-12 h-12 relative overflow-hidden">
                            <Image
                                src="/favicon.svg"
                                alt="모각작 로고"
                                width={48}
                                height={48}
                            />
                        </div>
                        <div className="w-40 inline-flex flex-col justify-start items-start gap-1">
                            <div className="self-stretch justify-start text-neutral-900 text-xl font-semibold font-['Pretendard'] leading-7">
                                모각작
                            </div>
                            <div className="w-[165px] self-stretch justify-start text-zinc-700 text-base font-normal font-['Pretendard'] leading-6">모여서 각자 작업하는 시간</div>
                        </div>
                    </div>

                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                        <div className="inline-flex justify-start items-center gap-4">
                            <button
                                type="button"
                                onClick={onAllAgree}
                                className="w-6 h-6 relative overflow-hidden cursor-pointer"
                            >
                                <Image
                                    src={allAgreed ? "/Icons/agree.svg" : "/Icons/agreeNon.svg"}
                                    alt={allAgreed ? "체크됨" : "미체크"}
                                    width={24}
                                    height={24}
                                />
                            </button>
                            <div className="justify-start text-neutral-900 text-base font-semibold font-['Pretendard'] leading-6">
                                모두 동의합니다.
                            </div>
                        </div>
                        <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-gray-200"></div>

                        <div className="self-stretch flex flex-col justify-start items-start gap-4">
                            <AgreementItem
                                label="[필수] 서비스 이용약관 동의"
                                allAgreed={agreements.service}
                                onChange={() => onAgreementChange("service")}
                                onViewClick={() => setDetailModalType("service")}
                            />
                            <AgreementItem
                                label="[필수] 개인 정보 수집 및 이용 동의"
                                allAgreed={agreements.privacy}
                                onChange={() => onAgreementChange("privacy")}
                                onViewClick={() => setDetailModalType("privacy")}
                            />
                            <AgreementItem
                                label="[선택] 마케팅 정보 수신 동의 (카카오톡, 이메일 등)"
                                allAgreed={agreements.marketing}
                                onChange={() => onAgreementChange("marketing")}
                                showViewButton={false}
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={onSubmit}
                    disabled={!isValid || isSubmitting}
                    className={isValid && !isSubmitting
                        ? "h-12 px-6 py-3 bg-red-500 rounded-2xl inline-flex justify-center items-center gap-2 overflow-hidden"
                        : "h-12 px-6 py-3 bg-gray-200 rounded-2xl inline-flex justify-center items-center gap-2 overflow-hidden"
                    }
                >
                    <div className={isValid && !isSubmitting
                        ? "justify-start text-neutral-50 text-base font-semibold font-['Pretendard'] leading-6"
                        : "justify-start text-gray-400 text-base font-semibold font-['Pretendard'] leading-6"
                    }>
                        {isSubmitting ? "처리 중..." : "동의하고 계속하기"}
                    </div>
                </button>
            </div>
        </div>
            {detailModalType && (
                <AgreementDetailModal
                    type={detailModalType}
                    onClose={() => setDetailModalType(null)}
                />
            )}
        </>
    );
}

function AgreementItem({
    label,
    allAgreed,
    onChange,
    onViewClick,
    showViewButton = true,
}: {
    label: string;
    allAgreed: boolean;
    onChange: () => void;
    onViewClick?: () => void;
    showViewButton?: boolean;
}) {
    return (
        <div className="self-stretch inline-flex justify-between items-start">
            <div className="flex justify-start items-center gap-4">
                <button
                    type="button"
                    onClick={onChange}
                    className="w-6 h-6 relative overflow-hidden cursor-pointer"
                >
                    <Image
                       src={allAgreed ? "/Icons/agree.svg" : "/Icons/agreeNon.svg"}
                       alt={allAgreed ? "체크됨" : "미체크"}
                       width={24}
                       height={24}
                     />
                </button>
                <div className="justify-start text-zinc-700 text-sm font-semibold font-['Pretendard'] leading-5">
                    {label}
                </div>
            </div>
            {showViewButton && (
                <button
                    className="justify-start text-gray-400 text-sm font-semibold font-['Pretendard'] underline leading-5"
                    onClick={(e) => {
                        e.preventDefault();
                        onViewClick?.();
                    }}
                >
                    보기
                </button>
            )}
        </div>
    );
}

