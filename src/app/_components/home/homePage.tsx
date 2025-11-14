"use client";

import { useState } from "react";
import FriendMain from "./friendMain";
import PreviewMain from "./previewMain";
import RoomMain from "./roomMain";
import GroupPage from "../group/groupPage";

export default function HomePage() {
  const [state, setState] = useState(false);
  const handlePage = () => {
    console.log("그룹방으로 이동");
    setState(true);
  };
  return (
    <main className="w-full h-full max-w-[1440px] pt-9 mx-auto flex gap-5 overflow-x-hidden">
      <div className="self-stretch ">
        <PreviewMain state={state} />
      </div>
      {state ? (
        <GroupPage />
      ) : (
        <section className="w-full flex-1 flex flex-col justify-between">
          <RoomMain onPage={handlePage} />
          <FriendMain />
        </section>
      )}
    </main>
  );
}
