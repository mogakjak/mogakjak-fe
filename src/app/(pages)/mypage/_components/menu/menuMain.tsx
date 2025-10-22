"use client";

import { useState } from "react";
import MenuTab from "./menuTab";

export default function Menu() {
  const [selected, setSelected] = useState("내 채소 바구니");

  const menuItems = ["내 채소 바구니", "내 모각작 메이트"];

  return (
    <div className="w-[327px] p-6 rounded-[20px] bg-white">
      <h2 className="text-heading4-20SB text-black mb-7">MENU</h2>

      <div className="flex flex-col gap-3">
        {menuItems.map((item) => (
          <MenuTab
            key={item}
            title={item}
            selected={selected === item}
            onClick={() => setSelected(item)}
          />
        ))}
      </div>
    </div>
  );
}
