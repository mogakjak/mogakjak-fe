"use client";

import Image from "next/image";
import React from "react";

interface GroupModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function GroupModal({ children, onClose }: GroupModalProps) {
  return (
    <div className="p-5 bg-white rounded-[20px] shadow-md">
      <button className="flex ml-auto" onClick={onClose}>
        <Image src="/Icons/xmark.svg" alt="닫기" width={24} height={24} />
      </button>
      {children}
    </div>
  );
}
