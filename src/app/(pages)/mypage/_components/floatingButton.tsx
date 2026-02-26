"use client";

import { useState } from "react";
import SupportModal from "@/app/_components/common/supportModal";
import Image from "next/image";

export default function FloatingSupportButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="fixed bottom-5 right-5 z-40 w-20 h-20">
                <Image src="/Icons/fab.svg" alt="fab" width={80} height={80} className="w-20 h-20" />
            </button>

            <SupportModal isOpen={isOpen} onClose={() => setIsOpen(false)} isFloating />
        </>
    );
}