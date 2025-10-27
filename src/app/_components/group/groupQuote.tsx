"use client";

import { useRef, useState } from "react";
import GroupQuoteCTA from "../common/groupQuoteCTA";

export default function GroupQuote() {
  const [mode, setMode] = useState<"edit" | "check">("edit");
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const toEdit = () => {
    setMode("edit");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const toCheck = () => {
    setMode("check");
  };

  const toggleMode = () => (mode === "edit" ? toCheck() : toEdit());

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mode === "edit" && e.key === "Enter") {
      e.preventDefault();
      toCheck();
    }
  };

  return (
    <div className=" flex items-center bg-white rounded-2xl px-5 py-4 w-[790px]">
      <div className="flex-1 flex flex-col gap-1">
        <p className="text-gray-500 text-caption-12R">
          오늘 모각작 메이트들에게 하고 싶은 말을 전해보세요
        </p>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={mode === "check"}
          placeholder="우리 함께 몰입해요~"
          className={`w-full bg-transparent text-gray-800 rounded-lg
              outline-none border-none caret-black transition 
              ${
                mode === "check"
                  ? "cursor-default text-gray-500 select-none"
                  : "cursor-text"
              }`}
        />
      </div>

      <GroupQuoteCTA mode={mode} onToggle={toggleMode} />
    </div>
  );
}
