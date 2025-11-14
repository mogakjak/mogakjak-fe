"use client";

import TimerComponent from "../common/timer/timerComponent";
import GroupMySidebar from "../group/sidebar/groupMySidebar";
import PreviewCharacter from "./preview/previewCharacter";
import Quotes from "./preview/quotes";

type PreviewMainProps = {
  state: boolean;
};

export default function PreviewMain({ state }: PreviewMainProps) {
  return (
    <div className="h-full w-[327px] min-w-[327px] flex flex-col px-6 py-6 rounded-[20px] bg-white">
      <PreviewCharacter />
      {state ? <GroupMySidebar /> : <Quotes />}
      <TimerComponent></TimerComponent>
    </div>
  );
}
