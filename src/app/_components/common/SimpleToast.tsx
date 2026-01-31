"use client";

import Image from "next/image";
import clsx from "clsx";

interface SimpleToastProps {
    message: string;
    isVisible: boolean;
    position?: "center" | "top";
}

export default function SimpleToast({
    message,
    isVisible,
    position = "center",
}: SimpleToastProps) {
    if (!isVisible) return null;

    return (
        <div
            className={clsx(
                "fixed left-0 right-0 z-[100] pointer-events-none flex justify-center",
                position === "center" ? "inset-0 items-center" : "top-20",
            )}
        >
            <div className="w-96 h-9 px-4 py-1.5 bg-zinc-600/80 rounded shadow-[0px_0px_12px_0px_rgba(0,0,0,0.15)] backdrop-blur-sm inline-flex justify-start items-center gap-2 overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="w-6 h-6 relative shrink-0">
                    <Image
                        src="/Icons/checkGreen.svg"
                        alt="체크"
                        width={24}
                        height={24}
                        className="w-full h-full"
                    />
                </div>
                <div className="text-neutral-50 text-sm font-normal leading-5 truncate">
                    {message}
                </div>
            </div>
        </div>
    );
}
