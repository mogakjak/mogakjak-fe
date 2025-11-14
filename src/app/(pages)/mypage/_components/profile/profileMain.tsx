"use client";

import Image from "next/image";
import ProfileEditButton from "./profileEditButton";
import ProfileInfo from "./profileInfo";
import { useCharacterBasket } from "@/app/_hooks/mypage";

export default function Profile() {
  const { data: basket } = useCharacterBasket();
  const {
    nickname,
    email,
    totalTaskCount,
    totalFocusTime,
    collectedCharacterCount,
  } = basket ?? {};

  return (
    <div className="w-[327px] h-full p-6 rounded-[20px] bg-white flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <h2 className="text-heading4-20SB text-black">내 프로필</h2>
        <button className="text-body2-14R text-gray-500 underline">
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
        <ProfileEditButton />
      </section>

      <section className="flex flex-col gap-3">
        <ProfileInfo title="완료한 작업" content={`${totalTaskCount}개`} />
        <ProfileInfo title="완료한 시간" content={`${totalFocusTime}`} />
        <ProfileInfo
          title="수집 캐릭터"
          content={`${collectedCharacterCount}개`}
        />
      </section>
    </div>
  );
}
