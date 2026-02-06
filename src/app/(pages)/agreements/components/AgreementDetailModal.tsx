"use client";

import Image from "next/image";
import { SERVICE_TERMS_TITLE, SERVICE_TERMS_CONTENT, PRIVACY_TERMS_TITLE, PRIVACY_TERMS_CONTENT } from "../constants/agreementTexts";

interface AgreementDetailModalProps {
    type: "service" | "privacy";
    onClose: () => void;
}

export default function AgreementDetailModal({ type, onClose }: AgreementDetailModalProps) {
    const content = type === "service" ? SERVICE_TERMS_CONTENT : PRIVACY_TERMS_CONTENT;
    const displayTitle = type === "service" ? SERVICE_TERMS_TITLE : PRIVACY_TERMS_TITLE;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
            <div className="w-[516px] h-[660px] p-6 bg-neutral-50 rounded-[20px] shadow-[0px_0px_28px_0px_rgba(0,0,0,0.15)] inline-flex flex-col justify-start items-start gap-5 overflow-hidden">
                <div className="inline-flex justify-start items-center gap-4">
                    <button
                        onClick={onClose}
                        className="w-6 h-6 relative overflow-hidden"
                        aria-label="뒤로가기"
                    >
                        <Image src="/Icons/arrowRight.svg" alt="닫기" width={24} height={24} />
                    </button>
                    <div className="justify-start text-neutral-900 text-base font-semibold font-['Pretendard'] leading-6">
                        {displayTitle}
                    </div>
                </div>
                <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-gray-200"></div>
                <div className="self-stretch flex-1 inline-flex justify-start items-start gap-3 overflow-hidden">
                    <div className="flex-1 self-stretch pl-4 inline-flex flex-col justify-start items-start gap-5 overflow-y-auto">
                        <div className="self-stretch flex-1 justify-start whitespace-pre-line">
                            <span className="text-zinc-700 text-sm font-normal font-['Pretendard'] leading-5">
                                {content}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

