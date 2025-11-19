"use client";

import { useState } from "react";
import Image from "next/image";
import ProfileEditButton from "./profileEditButton";
import ProfileInfo from "./profileInfo";
import ProfileEditModal from "./profileEditModal";

import type { CharacterBasket } from "@/app/_types/mypage";

export default function Profile({ basket }: { basket: CharacterBasket }) {
  const {
    nickname,
    email,
    totalTaskCount,
    totalFocusTime,
    collectedCharacterCount,
  } = basket;

  const [openEdit, setOpenEdit] = useState(false);

  const handleEditOpen = () => setOpenEdit(true);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      window.location.href = "/login";
    }
  };

  return (
    <div className="w-[327px] h-full p-6 rounded-[20px] bg-white flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <h2 className="text-heading4-20SB text-black">내 프로필</h2>
        <button
          className="text-body2-14R text-gray-500 underline"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>

      <section className="flex flex-col items-center">
        <Image
          src="/profileDefault.svg"
          alt="프로필 기본"
          width={130}
          height={130}
        />
        <div className="flex flex-col gap-1 text-center mt-5 mb-2">
          <p className="text-heading3-24SB text-black">{nickname}</p>
          <p className="text-body1-16R text-gray-500">{email}</p>
        </div>
        <ProfileEditButton openEdit={handleEditOpen} />
      </section>

      <section className="flex flex-col gap-3">
        <ProfileInfo title="완료한 작업" content={`${totalTaskCount}개`} />
        <ProfileInfo title="완료한 시간" content={`${totalFocusTime}`} />
        <ProfileInfo
          title="수집 캐릭터"
          content={`${collectedCharacterCount}개`}
        />
      </section>

      {openEdit && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenEdit(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <ProfileEditModal
              onClose={() => setOpenEdit(false)}
              initialNickname={nickname}
              initialEmail={email}
            />
          </div>
        </div>
      )}
    </div>
  );
}
