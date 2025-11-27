"use client";

interface IntroModalProps {
    title: string;
    description?: string;
    position: "left" | "right" | "top" | "bottom";
    buttonText?: string;
    hideButton?: boolean;
    onClick?: () => void;
    onPrevClick?: () => void;
}

export default function IntroModal({ title, description, position, onClick, buttonText, hideButton, onPrevClick }: IntroModalProps) {
    const positionClasses = {
        left: "right-full mr-4",
        right: "left-full ml-4",
        top: "bottom-full mb-4",
        bottom: "top-full mt-4"
    };

    return (
        <div
            className={`absolute ${positionClasses[position]} ${buttonText ? "w-[420px]" : "w-[360px]"
                } z-10 top-1/2 -translate-y-1/2`}
        >

            <div
                className="w-full bg-white rounded-2xl p-6 shadow-[0_0_30px_5px_rgba(0,0,0,0.2)] cursor-pointer"
                onClick={onClick}
            >
                <p className="text-sm font-bold text-red-500 mb-2 text-center">tip!</p>

                <div className="flex flex-col items-center">
                    <h3 className="text-body1-16R text-gray-700 mb-2 text-center whitespace-pre-line">{title}</h3>
                    {description && (
                        <p className="text-body2-14R text-gray-600 text-center">{description}</p>
                    )}
                </div>


                {!hideButton && (
                    buttonText ? (
                        <div className="flex justify-end gap-2 mt-3">
                            {onPrevClick && (
                                <button
                                    className="px-4 py-2 bg-gray-400 text-white rounded-lg text-body2-14SB "
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPrevClick();
                                    }}
                                >
                                    이전
                                </button>
                            )}
                            <button
                                className={`px-4 py-2 bg-red-400 text-white rounded-lg text-body2-14SB `}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClick?.();
                                }}
                            >
                                {buttonText}
                            </button>
                        </div>
                    ) : (
                        <p className="text-caption-12R text-gray-400 mt-3 text-center">
                            클릭하여 다음 단계로
                        </p>
                    )
                )}
            </div>
        </div >
    );
}