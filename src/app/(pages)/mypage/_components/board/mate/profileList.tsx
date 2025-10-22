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
  const profiles: Profile[] = [
    {
      id: 1,
      name: "토마토",
      src: "/character/tomato.svg",
      active: true,
      groups: ["그룹이름가나다라", "그룹이름AB"],
    },
    {
      id: 2,
      name: "당근",
      src: "/character/tomato.svg",
      active: false,
      groups: ["그룹이름가나다라"],
    },
    {
      id: 3,
      name: "브로콜리",
      src: "/character/tomato.svg",
      active: true,
      groups: ["그룹이름ABCDE"],
    },
    {
      id: 4,
      name: "양파",
      src: "/character/tomato.svg",
      active: false,
      groups: ["그룹이름AB"],
    },
    {
      id: 5,
      name: "브로콜리",
      src: "/character/tomato.svg",
      active: false,
      groups: ["그룹이름AB"],
    },
    {
      id: 6,
      name: "파프리카",
      src: "/character/tomato.svg",
      active: true,
      groups: ["그룹이름ABCDE"],
    },
    {
      id: 7,
      name: "감자",
      src: "/character/tomato.svg",
      active: false,
      groups: ["그룹이름가나다라"],
    },
    {
      id: 8,
      name: "가지",
      src: "/character/tomato.svg",
      active: false,
      groups: ["그룹이름AB"],
    },
    {
      id: 9,
      name: "옥수수",
      src: "/character/tomato.svg",
      active: true,
      groups: ["그룹이름ABCDE"],
    },
  ];

  const norm = (s: string) => s.trim().toLowerCase();
  const q = norm(search);

  const filtered = useMemo(() => {
    const byGroup =
      groupName === "전체 그룹"
        ? profiles
        : profiles.filter((p) => p.groups.includes(groupName));

    if (!q) return byGroup;
    return byGroup.filter((p) => norm(p.name).includes(q));
  }, [groupName, q]);

  useEffect(() => {
    onCountChange?.(filtered.length);
  }, [filtered.length, onCountChange]);

  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return (
    <div className="flex flex-col h-[552px] mt-7 mb-16">
      {paged.map((profile) => (
        <div
          key={profile.id}
          className="flex items-center border-b border-gray-200 px-5 py-4"
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
        <p className="text-sm text-gray-400 px-5 py-8">
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
