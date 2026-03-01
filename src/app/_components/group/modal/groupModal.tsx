"use client";

import Image from "next/image";
import React from "react";

interface GroupModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function GroupModal({ children, onClose }: GroupModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
      <div className="p-5 bg-white rounded-[20px] shadow-md relative z-[10000]">
        <button className="flex ml-auto" onClick={onClose} aria-label="닫기">
          <Image src="/Icons/xmark.svg" alt="닫기" width={24} height={24} />
        </button>
        {children}
      </div>
    </div>
  );
}
