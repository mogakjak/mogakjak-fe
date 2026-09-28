"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { sendGAEvent } from "@next/third-parties/google";
import ProfileListHome from "./profileListHome";
import ForkPopup from "@/app/_components/common/forkPopup";
import { useMates } from "@/app/_hooks/groups/useMates";
import { usePoke } from "@/app/_hooks/groups/usePoke";
import { useCommonGroups } from "@/app/_hooks/groups/useCommonGroups";
import {
  useMateActiveStatus,
  type UserActiveStatusEvent,
} from "@/app/_hooks/_websocket/status/useMateActiveStatus";

const HOME_MATE_PAGE_SIZE = 20;

export default function HomeMateCard() {
  const { data: matesData, isLoading } = useMates({
    page: 0,
    size: HOME_MATE_PAGE_SIZE,
  });
  const [liveStatus, setLiveStatus] = useState<Record<string, boolean>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: commonGroups = [], isLoading: isLoadingGroups } =
    useCommonGroups(selectedUserId || "");
  const pokeMutation = usePoke();

  const handleStatusChange = useCallback((event: UserActiveStatusEvent) => {
    setLiveStatus((prev) => ({ ...prev, [event.userId]: event.isActive }));
  }, []);

  useMateActiveStatus({ enabled: true, onStatusChange: handleStatusChange });

  const mates = useMemo(() => {
    const list = (matesData?.content ?? []).map((mate) => ({
      mate,
      isActive: liveStatus[mate.userId] ?? mate.isActive ?? false,
    }));
    return list.sort((a, b) => Number(b.isActive) - Number(a.isActive));
  }, [matesData, liveStatus]);

  const selectedMate = mates.find(({ mate }) => mate.userId === selectedUserId);

  const closeModal = () => setSelectedUserId(null);

  const handleJoinGroup = (groupId: string) => {
    if (!selectedUserId) return;
    pokeMutation.mutate(
      { targetUserId: selectedUserId, groupId },
      {
        onSuccess: () => {
          sendGAEvent("event", "poke_send", {
            group_id: groupId,
            to_user_id: selectedUserId,
          });
          closeModal();
        },
      }
    );
  };

  return (
    <div className="w-full flex-1 min-h-0 bg-white rounded-[20px] px-7 pt-6 pb-4 flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-heading4-20SB text-black">메이트</h2>
        <Link
          href="/mypage?tab=mate"
          className="flex items-center gap-0.5 text-body2-14R text-gray-500 hover:text-gray-700"
        >
          전체 보기
          <Image src="/Icons/right.svg" alt="" width={16} height={16} />
        </Link>
      </div>

      <div className="mt-3 flex-1 min-h-0 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2 animate-pulse">
                <div className="size-12 rounded-full bg-gray-200" />
                <div className="h-4 w-20 rounded bg-gray-200" />
                <div className="ml-auto h-9 w-16 rounded-xl bg-gray-200" />
              </div>
            ))}
          </div>
        ) : mates.length === 0 ? (
          <p className="h-full flex items-center justify-center text-center text-body2-14SB text-gray-500">
            그룹 생성 후
            <br />
            메이트를 초대해보세요!
          </p>
        ) : (
          mates.map(({ mate, isActive }) => (
            <ProfileListHome
              key={mate.userId}
              mate={mate}
              isActive={isActive}
              onPoke={setSelectedUserId}
            />
          ))
        )}
      </div>

      {selectedUserId && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {isLoadingGroups ? (
              <div className="bg-white p-8 rounded-2xl">
                <p className="text-center">그룹 목록을 불러오는 중...</p>
              </div>
            ) : (
              <ForkPopup
                userName={selectedMate?.mate.nickname ?? ""}
                groups={commonGroups}
                targetUserId={selectedUserId}
                onJoin={handleJoinGroup}
                onClose={closeModal}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
