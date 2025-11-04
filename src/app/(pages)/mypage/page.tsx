"use client";

import { useState } from "react";
import Board from "./_components/board/boardMain";
import Menu from "./_components/menu/menuMain";
import Profile from "./_components/profile/profileMain";

export default function MyPage() {
  const [selectedMenu, setSelectedMenu] = useState("내 과일 바구니");

  return (
    <div className="w-full max-w-[1440px] min-h-screen py-9 mx-auto flex gap-5 items-stretch overflow-x-hidden">
      <section className="flex flex-col gap-5 self-stretch">
        <Menu selected={selectedMenu} onSelect={setSelectedMenu} />
        <Profile />
      </section>

      <section className="w-full self-stretch">
        <Board selectedMenu={selectedMenu} />
      </section>
    </div>
  );
}
