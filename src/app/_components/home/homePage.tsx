"use client";

import { useState } from "react";
import FriendMain from "./friendMain";
import PreviewMain from "./previewMain";
import RoomMain from "./roomMain";

export default function HomePage() {
  return (
    <main className="w-full max-w-[1440px] pt-9 mx-auto flex gap-5 overflow-x-hidden">
      <div className="self-stretch">
        <PreviewMain />
      </div>
      <section className="w-full flex-1 flex flex-col justify-between">
        <RoomMain />
        <FriendMain />
      </section>
    </main>
  );
}
