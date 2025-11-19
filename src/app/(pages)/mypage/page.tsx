"use client";

import { useState } from "react";
import Board from "./_components/board/boardMain";
import Menu from "./_components/menu/menuMain";
import Profile from "./_components/profile/profileMain";
import { useCharacterBasket } from "@/app/_hooks/mypage";

export default function MyPage() {
  const [selectedMenu, setSelectedMenu] = useState("내 과일 바구니");

  const { data: basket, isLoading } = useCharacterBasket();

  return (
    <div className="w-full max-w-[1440px] h-full pt-9 mx-auto flex gap-5 items-stretch overflow-x-hidden">
      {isLoading || !basket ? (
        <>
          <section className="flex flex-col gap-5 self-stretch w-[360px] animate-pulse">
            <div className="w-full h-[120px] rounded-[20px] bg-gray-100" />
            <div className="w-full h-[260px] rounded-[20px] bg-gray-100" />
          </section>

          <section className="w-full self-stretch animate-pulse">
            <div className="w-full h-[552px] rounded-[20px] bg-gray-100" />
          </section>
        </>
      ) : (
        <>
          <section className="flex flex-col gap-5 self-stretch">
            <Menu selected={selectedMenu} onSelect={setSelectedMenu} />
            <Profile basket={basket} />
          </section>

          <section className="w-full self-stretch">
            <Board selectedMenu={selectedMenu} basket={basket} />
          </section>
        </>
      )}
    </div>
  );
}
