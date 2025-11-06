"use client";

import clsx from "clsx";
import PersonalProfile from "./personalProfile";
import PersonalData from "./personalData";
import TimerComponent from "@/app/_components/common/timer/timerComponent";
import FriendList from "./friendList";
import { mockFriends, mockForkGroups } from "@/app/_utils/mockData";

export default function PersonalPage() {
  return (
    <main
      className={clsx(
        "w-full min-h-screen px-12 py-10",
        "flex flex-col items-center justify-start",
      )}
    >
      <div className="w-full max-w-[1280px] flex gap-10">
        <div className="flex flex-col gap-5 w-[327px]">
          <PersonalProfile />
          <PersonalData />
        </div>
        <div className="flex flex-col flex-1 gap-7">
          <TimerComponent />
          <FriendList friends={mockFriends} groupsForPoke={mockForkGroups} />
        </div>
      </div>
    </main>
  );
}
