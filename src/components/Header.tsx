"use client";

import Image from "next/image";
import { memo, useState } from "react";
import clsx from "clsx";

type TabKey = "home" | "todo" | "log" | "profile"; 

type HeaderProps = {
  active?: TabKey;
  onChangeTab?: (key: TabKey) => void;
  className?: string;
};

export default memo(function Header({
  active: externalActive,
  onChangeTab,
  className = "",
}: HeaderProps) {
  const [internalActive, setInternalActive] = useState<TabKey | undefined>(undefined);
  const active = externalActive ?? internalActive;

  const handleClick = (key: TabKey) => {
    setInternalActive(key);
    onChangeTab?.(key);
  };
  const profileSrc = active === "profile" ? "/profileSelected.svg" : "/profileDefault.svg";

  return (
    <header
      className={clsx(
        "w-full h-16 px-9 py-2 bg-neutral-50 flex justify-between items-center",
        className,
      )}
    >
      <Image src="/logo.svg" alt="모각작 로고" width={112} height={36} priority />

      <div className="flex items-center gap-6">
        <nav className="flex items-center gap-3">
          <PillTab label="홈"   selected={active === "home"} onClick={() => handleClick("home")} />
          <PillTab label="TO DO" selected={active === "todo"} onClick={() => handleClick("todo")} />
          <PillTab label="기록"  selected={active === "log"}  onClick={() => handleClick("log")} />
        </nav>
        <button
          type="button"
          onClick={() => handleClick("profile")}
          aria-current={active === "profile" ? "page" : undefined}
          aria-label="프로필"
          className={clsx(
            "rounded-full transition-transform active:scale-95",
          )}
        >
          <Image
            src={profileSrc}
            alt="프로필 아이콘"
            width={40}
            height={40}
            className="rounded-full select-none"
          />
        </button>
      </div>
    </header>
  );
});

type PillTabProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

function PillTab({ label, selected, onClick }: PillTabProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-28 h-10 px-7 py-3 rounded-3xl flex justify-center items-center transition-all",
        selected
          ? "bg-red-500 text-white font-semibold"
          : "bg-white text-zinc-600 font-medium  outline-1 outline-gray-200",
      )}
    >
      {label}
    </button>
  );
}
