"use client";

import TimerComponent from "../common/timer/timerComponent";
import PreviewCharacter from "./preview/previewCharacter";
import Quotes from "./preview/quotes";

export default function PreviewMain() {
  return (
    <div className="h-full w-[327px] min-w-[327px] flex flex-col px-6 py-9 rounded-[20px] bg-white">
      <PreviewCharacter />
      <Quotes />
      <TimerComponent></TimerComponent>
    </div>
  );
}
