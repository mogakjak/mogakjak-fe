"use client";

import { useState } from "react";
import Board from "./_components/board/boardMain";
import Menu from "./_components/menu/menuMain";
import Profile from "./_components/profile/profileMain";

export default function MyPage() {
  const [selectedMenu, setSelectedMenu] = useState("내 채소 바구니");

  return (
    <div className="w-full max-w-[1440px] min-h-screen py-9 mx-auto flex gap-5 items-center overflow-x-hidden">
      <section className="flex flex-col gap-5">
        <Menu selected={selectedMenu} onSelect={setSelectedMenu} />
        <Profile />
      </section>
      <Board selectedMenu={selectedMenu} />
    </div>
  );
}
