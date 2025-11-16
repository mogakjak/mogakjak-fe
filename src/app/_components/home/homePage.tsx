"use client";

import PreviewMain from "./previewMain";
import FriendMain from "./friendMain";
import RoomMain from "./roomMain";

export default function HomePage() {
  return (
    <main className="w-full h-full max-w-[1440px] mx-auto flex gap-5 overflow-x-hidden pt-9">
      <div className="self-stretch">
        <PreviewMain state={false} />
      </div>

      <section className="w-full flex-1 flex flex-col justify-between">
        <RoomMain />
        <FriendMain />
      </section>
    </main>
  );
}
