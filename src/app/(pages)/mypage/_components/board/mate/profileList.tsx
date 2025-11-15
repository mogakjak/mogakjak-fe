"use client";

import { useEffect, useMemo } from "react";
import ProfileActive from "./profileActive";
import ForkButton from "./forkButton";

interface Profile {
  id: number;
  name: string;
  src: string;
  active: boolean;
  groups: string[];
}

interface ProfileListProps {
  groupName: string;
  page?: number;
  pageSize?: number;
  onCountChange?: (n: number) => void;
  search?: string;
}

export default function ProfileList({
  groupName,
  page = 1,
  pageSize = 6,
  onCountChange,
  search = "",
}: ProfileListProps) {
  const profiles = useMemo<Profile[]>(() => [], []);

  const norm = (s: string) => s.trim().toLowerCase();
  const q = norm(search);

  const filtered = useMemo(() => {
    const byGroup =
      groupName === "전체 그룹"
        ? profiles
        : profiles.filter((p) => p.groups.includes(groupName));

    if (!q) return byGroup;
    return byGroup.filter((p) => norm(p.name).includes(q));
  }, [groupName, profiles, q]);

  useEffect(() => {
    onCountChange?.(filtered.length);
  }, [filtered.length, onCountChange]);

  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return (
    <div className="flex flex-col h-[552px] mb-1">
      {paged.map((profile) => (
        <div
          key={profile.id}
          className="flex items-center border-b border-gray-200 px-5 py-3"
        >
          <ProfileActive
            src={profile.src}
            name={profile.name}
            active={profile.active}
          />

          <p className="text-heading4-20SB text-black ml-7">{profile.name}</p>

          <div className="w-px h-5 bg-black m-2" />
          <div className="text-gray-500 text-body1-16R flex gap-2">
            <p>{profile.groups.join(", ")}</p>
            <p>·</p>
            <p>{profile.active ? "몰입 중" : "대기 중"}</p>
          </div>

          <div className="ml-auto">
            <ForkButton active={profile.active} />
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="flex h-full items-center justify-center text-gray-400">
          {q ? (
            <>
              검색어 <span className="font-semibold">“{search}”</span>에
              해당하는 메이트가 없습니다.
            </>
          ) : (
            <>해당 그룹에 속한 메이트가 없습니다.</>
          )}
        </p>
      )}
    </div>
  );
}
