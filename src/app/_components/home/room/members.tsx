"use client";

import MemberProfile from "./memberProfile";

type Size = "default" | "small";
type MemberItem = {
  id: number | string;
  isActive: boolean;
  profileUrl?: string;
};

interface MembersProps {
  members: MemberItem[];
  size?: Size;
  max?: number;
}

export default function Members({
  members,
  size = "default",
  max = 5,
}: MembersProps) {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;

  const sizeClass =
    size === "small" ? "w-7 h-7 text-[12px]" : "w-9 h-9 text-[14px]";
  const overlapClass = size === "small" ? "-ml-2" : "-ml-3";
  const ringClass = "rounded-full";

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

      <div className={`${rest > 0 ? "mr-5" : ""} flex items-center`}>
        {shown.map((m, idx) => (
          <div key={m.id} className={idx === 0 ? "" : overlapClass}>
            <MemberProfile
              isActive={m.isActive}
              size={size}
              profileUrl={m.profileUrl}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
