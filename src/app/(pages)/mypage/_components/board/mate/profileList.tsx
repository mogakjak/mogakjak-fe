"use client";

import { useEffect, useState } from "react";
import ProfileActive from "./profileActive";
import ForkButton from "./forkButton";
import { Mate } from "@/app/_types/groups";
import ForkPopup from "@/app/_components/common/forkPopup";
import { useCommonGroups, usePoke } from "@/app/_hooks/groups";

interface ProfileListProps {
  profiles: Mate[];
  totalCount: number;
  groupName?: string;
  page?: number;
  pageSize?: number;
  onCountChange?: (n: number) => void;
  search?: string;
  isLoading?: boolean;
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
  groupName,
}: ProfileListProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: commonGroups = [], isLoading: isLoadingGroups } =
    useCommonGroups(selectedUserId || "");
  const pokeMutation = usePoke();

  useEffect(() => {
    onCountChange?.(totalCount);
  }, [totalCount, onCountChange]);

  const handleForkClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const handleJoinGroup = (groupId: string) => {
    if (!selectedUserId) return;

    pokeMutation.mutate(
      {
        targetUserId: selectedUserId,
        groupId: groupId,
      },
      {
        onSuccess: () => {
          setShowModal(false);
          setSelectedUserId(null);
        },
        onError: (error) => {
          console.error("콕 찌르기 알림 전송 실패:", error);
        },
      }
    );
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
      {profiles.map((profile) => (
        <div
          key={profile.userId}
          className="flex items-center border-b border-gray-200 px-5 py-3"
        >
          <ProfileActive
            src={profile.profileUrl}
            name={profile.nickname}
            active={false}
          />

          <p className="text-heading4-20SB text-black ml-7">
            {profile.nickname}
          </p>

          <div className="w-px h-5 bg-black m-2" />
          <div className="text-gray-500 text-body1-16R flex gap-2">
            <p>{groupName}</p>
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
      
      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => {
            setShowModal(false);
            setSelectedUserId(null);
          }}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {isLoadingGroups ? (
              <div className="bg-white p-8 rounded-2xl">
                <p className="text-center">그룹 목록을 불러오는 중...</p>
              </div>
            ) : (
              <ForkPopup
                userName={
                  profiles.find((p) => p.userId === selectedUserId)?.nickname ||
                  ""
                }
                groups={commonGroups}
                onJoin={handleJoinGroup}
                onClose={() => {
                  setShowModal(false);
                  setSelectedUserId(null);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
