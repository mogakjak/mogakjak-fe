"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileActive from "./profileActive";
import ForkButton from "./forkButton";
import { Mate, MyGroup } from "@/app/_types/groups";
import { getUniqueProfiles } from "@/app/_utils/uniqueProfiles";
import ForkPopup, { ForkGroup } from "@/app/_components/common/forkPopup";
import { useMyGroups } from "@/app/_hooks/groups";

interface ProfileListProps {
  profiles: Mate[];
  totalCount: number;
  groupName?: string;
  page?: number;
  pageSize?: number;
  onCountChange?: (n: number) => void;
  search?: string;
  isLoading?: boolean;
  groups?: MyGroup[];
}

export default function ProfileList({
  profiles,
  totalCount,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  page = 1,
  pageSize = 6,
  onCountChange,
  search = "",
  isLoading = false,
  groups: propsGroups,
}: ProfileListProps) {
  const [openForkPopup, setOpenForkPopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const router = useRouter();

  const { data: myGroups = [] } = useMyGroups();
  const groups = propsGroups || myGroups;

  useEffect(() => {
    onCountChange?.(totalCount);
  }, [totalCount, onCountChange]);

  const uniqueProfiles = useMemo(() => {
    return getUniqueProfiles(profiles);
  }, [profiles]);

  // 내 그룹 목록을 ForkGroup 타입으로 변환
  const forkGroups: ForkGroup[] = useMemo(() => {
    return groups.map((group) => ({
      id: group.groupId,
      name: group.groupName,
      members: group.members.length,
      capacity: 8, // 기본 용량
      status: "active" as const, // 기본값, 실제로는 그룹 상태에 따라 결정
      avatarUrl: group.imageUrl,
    }));
  }, [groups]);

  // 선택된 사용자 정보
  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return uniqueProfiles.find((p) => p.profile.userId === selectedUserId);
  }, [selectedUserId, uniqueProfiles]);

  const handleForkClick = (userId: string) => {
    setSelectedUserId(userId);
    setOpenForkPopup(true);
  };

  const handleJoin = (groupId: string) => {
    setOpenForkPopup(false);
    setSelectedUserId(null);
    router.push(`/group/${groupId}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[552px] mb-1">
        {Array.from({ length: pageSize }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center border-b border-gray-200 px-5 py-3 animate-pulse"
          >
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="ml-7 h-5 w-24 bg-gray-200 rounded" />
            <div className="ml-4 h-4 w-40 bg-gray-100 rounded" />
            <div className="ml-auto h-8 w-16 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="flex flex-col h-[552px] mb-1">
        <p className="flex h-full items-center justify-center text-gray-500 text-lg font-semibold">
          {search ? (
            <>
              검색어 <span className="font-semibold">“{search}”</span>에
              해당하는 메이트가 없습니다.
            </>
          ) : (
            <>그룹 생성 후 메이트를 초대해보세요!</>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[552px] mb-1">
      {uniqueProfiles.map(({ profile, groupNames }) => (
        <div
          key={profile.userId}
          className="flex items-center border-b border-gray-200 px-5 py-3"
        >
          <ProfileActive
            src={profile.profileUrl}
            name={profile.nickname}
            active={true}
          />

          <p className="text-heading4-20SB text-black ml-7 max-w-[100px] truncate">
            {profile.nickname}
          </p>

          <div className="w-px h-5 bg-black m-2" />

          <div className="text-gray-500 text-body1-16R flex gap-2 flex-wrap">
            {groupNames.length > 0 ? (
              groupNames.map((name, idx) => (
                <span key={`${profile.userId}-${name}`}>
                  {idx > 0 && <span>,</span>}
                  <p className="inline">{name}</p>
                </span>
              ))
            ) : (
              <p>-</p>
            )}
            <p>·</p>
            <p>1일 전</p>
          </div>

          <div className="ml-auto">
            <ForkButton
              active={true}
              onClick={() => handleForkClick(profile.userId)}
            />
          </div>
        </div>
      ))}

      {openForkPopup && selectedUser && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => {
            setOpenForkPopup(false);
            setSelectedUserId(null);
          }}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <ForkPopup
              userName={selectedUser.profile.nickname}
              groups={forkGroups}
              onJoin={handleJoin}
            />
          </div>
        </div>
      )}
    </div>
  );
}
