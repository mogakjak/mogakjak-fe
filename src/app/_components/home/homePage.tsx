"use client";

import { useState } from "react";
import FriendMain from "./friendMain";
import PreviewMain from "./previewMain";
import RoomMain from "./roomMain";
import GroupPage from "../group/groupPage";

type PageState = "home" | "group" | "personal";

export default function HomePage() {
  const [pageState, setPageState] = useState<PageState>("home");
  return (
    <main className="w-full max-w-[1440px] min-h-screen py-9 mx-auto flex gap-5 overflow-x-hidden">
      {pageState == "home" ? (
        <>
          <div className="self-stretch">
            <PreviewMain setPageState={setPageState} />
          </div>
          <section className="w-full flex flex-col self-stretch gap-5">
            <RoomMain />
            <FriendMain />
          </section>
        </>
      ) : pageState == "group" ? (
        <GroupPage />
      ) : (
        "개인 타이머 UI"
      )}
    </main>
  );
}
