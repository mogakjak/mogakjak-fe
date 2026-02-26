import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    isFloating?: boolean; // true면 플로팅 버튼용 텍스트, false/undefined면 헤더용 텍스트
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, isFloating = false }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[516px] transform rounded-[20px] bg-white p-5 pb-10"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <Image src={"/Icons/cancel.svg"} alt="close" width={24} height={24} />
                </button>

                <div className="mb-10 text-center mt-[52px]">
                    <h2 className="text-black text-heading3-24SB mb-3">
                        도움이 필요한가요?
                    </h2>
                    <p className="text-heading4-20R text-gray-500 font-medium">
                        작은 제보가 모각작을 성장시킵니다.<br />
                        언제든 편하게 남겨주세요!
                    </p>
                </div>

                <div className="space-y-2">
                    <Link
                        href="https://www.notion.so/30e3e052eacd80078f7ac9f57981e2b8#30e3e052eacd8076a19cfb86d7362755"
                        target="_blank"
                        onClick={onClose}
                        className="flex w-full items-center rounded-[8px] bg-gray-100 px-5 py-[13px] hover:bg-gray-200 transition-colors"
                    >
                        <div className="mr-3 flex h-6 w-6 items-center justify-center text-gray-500">
                            <Image src="/Icons/mail.svg" alt="bug" width={24} height={24} /> {/* 아이콘 경로가 있다면 교체하세요 */}
                        </div>
                        <span className="text-body1-16M text-gray-700">
                            {isFloating ? "버그 제보 · 기능 제안하기" : "버그 제보하기"}
                        </span>
                    </Link>

                    <Link
                        href="https://www.notion.so/FAQ-30e3e052eacd80feb4e1ea1a0c5a287d"
                        target="_blank"
                        onClick={onClose}
                        className="flex w-full items-center rounded-[8px] bg-gray-100 px-5 py-[13px] hover:bg-gray-200 transition-colors"
                    >
                        <div className="mr-3 flex h-6 w-6 items-center justify-center text-gray-500">
                            <Image src="/Icons/bug.svg" alt="question" width={24} height={24} />
                        </div>
                        <span className="text-body1-16M text-gray-700">
                            {isFloating ? "FAQ · 문의하기" : "FAQ (문의사항)"}
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SupportModal;