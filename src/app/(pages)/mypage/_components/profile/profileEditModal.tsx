"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import Image from "next/image";
import { useUpdateProfile } from "@/app/_hooks/mypage";

interface ProfileEditModalProps {
  onClose: () => void;
}

export default function ProfileEditModal({ onClose }: ProfileEditModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const isActive = name.trim() !== "";

  const handleSubmit = () => {
    if (!isActive || isPending) return;
    updateProfile(
      { nickname: name },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="bg-white p-5 w-[516px] rounded-[20px]">
      <button className="flex ml-auto" onClick={onClose}>
        <Image src="/Icons/xmark.svg" alt="닫기" width={24} height={24} />
      </button>

      <div className="p-5 flex flex-col items-center">
        <h2 className="text-heading4-20SB mb-[27px] text-center">
          프로필 수정
        </h2>

        <button className="w-[120px] h-[120px] rounded-full bg-gray-200 p-0 mb-5">
          버튼
        </button>

        <div className="flex flex-col gap-2 mb-5 w-full">
          <p>이름</p>
          <input
            placeholder="이름"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg py-2 px-3 bg-gray-100 border border-gray-200"
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <p>이메일</p>
          <input
            placeholder="이메일"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg py-2 px-3 bg-gray-100 border border-gray-200"
          />
        </div>

        <Button
          onClick={handleSubmit}
          className="px-10 mt-7"
          leftIcon={null}
          disabled={!isActive || isPending}
          variant={!isActive || isPending ? "muted" : "primary"}
        >
          {isPending ? "수정 중..." : "수정하기"}
        </Button>
      </div>
    </div>
  );
}
