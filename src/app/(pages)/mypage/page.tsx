"use client";

import { useState } from "react";
import Board from "./_components/board/boardMain";
import Menu from "./_components/menu/menuMain";
import Profile from "./_components/profile/profileMain";
import { useCharacterBasket } from "@/app/_hooks/mypage";

export default function MyPage() {
  const [selectedMenu, setSelectedMenu] = useState("내 과일 바구니");

  const { data: basket, isLoading } = useCharacterBasket();

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-600 text-body1-16SB">
        페이지 로딩 중...
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] h-full pt-9 mx-auto flex gap-5 items-stretch overflow-x-hidden">
      <section className="flex flex-col gap-5 self-stretch">
        <Menu selected={selectedMenu} onSelect={setSelectedMenu} />
        <Profile basket={basket} />
      </section>

      <section className="w-full self-stretch">
        <Board selectedMenu={selectedMenu} basket={basket} />
      </section>
    </div>
  );
}
