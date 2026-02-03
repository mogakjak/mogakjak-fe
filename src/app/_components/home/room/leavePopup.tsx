"use client";

import Image from "next/image";

interface LeavePopupProps {
    onLeaveClick: () => void;
}

export default function LeavePopup({ onLeaveClick }: LeavePopupProps) {
    return (
        <div className="flex flex-col bg-white rounded-xl shadow-[0_0_20px_0_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden min-w-[120px]">
            <button
                onClick={onLeaveClick}
                className="px-[34.5px] py-[24px] text-left text-body1-16SB hover:bg-red-50 transition-colors flex items-center gap-2"
            >
                <Image src="/Icons/out.svg" alt="나가기" width={20} height={20} />
                그룹 나가기
            </button>
        </div>
    );
}
