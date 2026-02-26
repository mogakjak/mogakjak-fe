"use client";

import { useState } from "react";
import SupportModal from "@/app/_components/common/supportModal";

export default function FloatingSupportButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="fixed bottom-8 right-8 z-40 rounded-full bg-red-500 w-12 h-12">
                d
            </button>

            <SupportModal isOpen={isOpen} onClose={() => setIsOpen(false)} isFloating />
        </>
    );
}