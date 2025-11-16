"use client";

import { useProfile } from "@/app/_hooks/mypage";
import TimerComponent from "../common/timer/timerComponent";
import GroupMySidebar from "../../(pages)/group/_components/sidebar/groupMySidebar";
import PreviewCharacter from "./preview/previewCharacter";
import Quotes from "./preview/quotes";

type PreviewMainProps = {
  state: boolean;
};

export default function PreviewMain({ state }: PreviewMainProps) {
  const { data: profile, isLoading } = useProfile();

  const isPending = isLoading || !profile;

  return (
    <div className="h-full w-[327px] min-w-[327px] flex flex-col justify-between px-6 py-6 rounded-[20px] bg-white">
      {isPending ? (
        <div className="flex flex-col gap-2 animate-pulse">
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
      ) : (
        <PreviewCharacter
          state={state}
          nickname={profile.nickname}
          character={profile.character}
        />
      )}

      {isPending ? (
        <div className="mt-4 w-full h-[60px] rounded-lg bg-gray-100 animate-pulse" />
      ) : (
        <>
          {!state && <Quotes Quotes={profile.quote} />}
          <GroupMySidebar state={state} />
        </>
      )}

      <TimerComponent />
    </div>
  );
}
