"use client";

import { useEffect, useState, useCallback } from "react";
import ProfileActive from "./profileActive";
import ForkButton from "./forkButton";
import { Mate } from "@/app/_types/groups";
import ForkPopup from "@/app/_components/common/forkPopup";
import { useCommonGroups } from "@/app/_hooks/groups/useCommonGroups";
import { usePoke } from "@/app/_hooks/groups/usePoke";
import { useMateActiveStatus } from "@/app/_hooks/_websocket/status/useMateActiveStatus";
import { formatLastActivity } from "@/app/_utils/formatLastActivity";

interface ProfileListProps {
  profiles: Mate[];
  totalCount: number;
  pageSize?: number;
  onCountChange?: (n: number) => void;
  search?: string;
  isLoading?: boolean;
}

export default function ProfileList({
  profiles,
  totalCount,
  pageSize = 6,
  onCountChange,
  search = "",
  isLoading = false,
}: ProfileListProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeStatusMap, setActiveStatusMap] = useState<
    Record<string, boolean>
  >({});
  const [lastActivityAtMap, setLastActivityAtMap] = useState<
    Record<string, string | null>
  >({});
  const { data: commonGroups = [], isLoading: isLoadingGroups } =
    useCommonGroups(selectedUserId || "");
  const pokeMutation = usePoke();

  // 초기 isActive 상태와 lastActivityAt을 맵에 저장 (기존 값은 유지)
  useEffect(() => {
    setActiveStatusMap((prev) => {
      const updated = { ...prev };
      profiles.forEach((profile) => {
        // WebSocket으로 업데이트된 값이 없을 때만 초기값 사용
        if (updated[profile.userId] === undefined) {
          updated[profile.userId] = profile.isActive ?? false;
        }
      });

      return updated;
    });

    setLastActivityAtMap((prev) => {
      const updated = { ...prev };
      profiles.forEach((profile) => {
        // WebSocket으로 업데이트된 값이 없을 때만 초기값 사용
        if (
          updated[profile.userId] === undefined &&
          profile.lastActivityAt !== undefined
        ) {
          updated[profile.userId] = profile.lastActivityAt ?? null;
        }
      });

      return updated;
    });
  }, [profiles]);

  // WebSocket으로 실시간 isActive 상태와 lastActivityAt 업데이트
  const handleStatusChange = useCallback(
    (event: {
      userId: string;
      isActive: boolean;
      lastActivityAt?: string | null;
    }) => {
      setActiveStatusMap((prev) => {
        const updated = {
          ...prev,
          [event.userId]: event.isActive,
        };

        return updated;
      });

      // lastActivityAt도 함께 업데이트
      if (event.lastActivityAt !== undefined) {
        setLastActivityAtMap((prev) => {
          const updated = {
            ...prev,
            [event.userId]: event.lastActivityAt ?? null,
          };

          return updated;
        });
      }
    },
    []
  );

  useMateActiveStatus({
    enabled: true,
    onStatusChange: handleStatusChange,
  });

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
        onError: () => {},
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
    <div className="flex flex-col h-[552px] mb-1 ">
      {profiles.map((profile) => {
        // 실시간 업데이트된 isActive 상태 사용 (없으면 초기값 사용)
        const isActive =
          activeStatusMap[profile.userId] ?? profile.isActive ?? false;
        // 실시간 업데이트된 lastActivityAt 사용 (없으면 초기값 사용)
        const lastActivityAt =
          lastActivityAtMap[profile.userId] ??
          profile.lastActivityAt ??
          null;
        // 포맷팅된 활동 시간 문자열 생성
        const lastActivityFormatted = formatLastActivity(
          lastActivityAt,
          isActive
        );

        return (
          <div
            key={profile.userId}
            className="flex items-center border-b border-gray-200 px-5 py-3"
          >
            <ProfileActive
              src={profile.profileUrl}
              name={profile.nickname}
              active={isActive}
            />

            <p className="text-heading4-20SB text-black ml-7">
              {profile.nickname}
            </p>

            <div className="w-px h-5 bg-black m-2" />
            <div className="text-gray-500 text-body1-16R flex gap-2">
              <div className="max-w-[200px] truncate">
                {(profile.groupNames || []).map((name, idx) => (
                  <span key={idx}>
                    {name}
                    {idx < (profile.groupNames || []).length - 1 && (
                      <span className="mx-1">,</span>
                    )}
                  </span>
                ))}
              </div>
              {lastActivityFormatted && (
                <>
                  <p>·</p>
                  <p>{lastActivityFormatted}</p>
                </>
              )}
            </div>

            <div className="ml-auto">
              <ForkButton
                active={isActive}
                onClick={() => handleForkClick(profile.userId)}
              />
            </div>
          </div>
        );
      })}

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
                targetUserId={selectedUserId || undefined}
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
