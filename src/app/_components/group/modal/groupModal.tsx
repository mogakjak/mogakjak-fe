import Image from "next/image";
import React from "react";

interface GroupModalProps {
  children: React.ReactNode;
}

export default function GroupModal({ children }: GroupModalProps) {
  return (
    <div className="p-5 bg-white rounded-[20px] shadow-md">
      <button className="flex ml-auto">
        <Image src="/Icons/xmark.svg" alt="닫기" width={24} height={24}></Image>
      </button>
      {children}
    </div>
  );
}
