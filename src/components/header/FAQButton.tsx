"use client";

import { useState } from "react";
import SupportModal from "@/app/_components/common/supportModal"; // 아까 만든 모달

export default function FAQButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-body1-16M text-gray-600 border border-gray-200 bg-gray-50 hover:text-red-500 hover:border-red-500 transition-colors rounded-[24px] px-7 py-2 "
            >
                FAQ
            </button>

            <SupportModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}