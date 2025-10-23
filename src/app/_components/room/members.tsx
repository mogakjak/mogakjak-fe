"use client";

import MemberProfile from "./memberProfile";

type Size = "default" | "small";
type MemberItem = { id: number | string; isActive: boolean };

interface MembersProps {
  members: MemberItem[];
  size?: Size;
  max?: number;
  isGuide?: boolean;
}

export default function Members({
  members,
  size = "default",
  max = 6,
  isGuide = false,
}: MembersProps) {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;

  const sizeClass =
    size === "small" ? "w-7 h-7 text-[12px]" : "w-9 h-9 text-[14px]";
  const overlapClass = size === "small" ? "-ml-2" : "-ml-3";
  const ringClass = "rounded-full";

  if (isGuide) {
    return (
      <div className="relative flex items-center">
        <div className={`absolute right-0 z-10 ${overlapClass}`}>
          <div
            className={`${ringClass} ${sizeClass} bg-gray-400 text-white flex items-center justify-center font-semibold`}
          >
            +n
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={i === 0 ? "" : overlapClass}>
            <MemberProfile isActive={true} size={size} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex items-center">
      {rest > 0 && (
        <div className={`absolute right-0 z-10 ${overlapClass}`}>
          <div
            className={`${ringClass} ${sizeClass} bg-gray-400 text-white flex items-center justify-center font-semibold`}
            aria-label={`추가 멤버 ${rest}명`}
            title={`+${rest}`}
          >
            +{rest}
          </div>
        </div>
      )}
      {shown.map((m, idx) => (
        <div key={m.id} className={idx === 0 ? "" : overlapClass}>
          <MemberProfile isActive={m.isActive} size={size} />
        </div>
      ))}
    </div>
  );
}
