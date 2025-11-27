"use client";

interface OnboardingCommonModalProps {
    title: string;
    description: string;
    buttonText: string;
    onClose: () => void;
}

export default function OnboardingCommonModal({
    title,
    description,
    buttonText,
    onClose
}: OnboardingCommonModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="flex flex-col items-center bg-white rounded-[20px] p-8 w-[520px] mx-4 shadow-2xl">
                <p className="text-heading3-24SB text-orange-500 mb-2 ">🎉</p>
                <h2 className="text-heading4-20SB text-black mb-4 text-center whitespace-pre-wrap">
                    {title}
                </h2>
                <p className="text-body1-16R text-gray-600 mb-6 text-center whitespace-pre-wrap">
                    {description}
                </p>
                <button
                    onClick={onClose}
                    className="px-7 py-3 rounded-2xl bg-red-500 text-white text-body1-16SB "
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}
