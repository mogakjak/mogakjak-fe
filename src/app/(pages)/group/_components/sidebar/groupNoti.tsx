"use client";

import { useState } from "react";
import Icon from "../../../../_components/common/Icons";
import Edit from "/Icons/edit.svg";
import NotiModal from "../../../../_components/group/modal/notiModal";
import { GroupDetail } from "@/app/_types/groups";
import ToggleButton from "@/app/_components/group/modal/toggleButton";
import { useToggleNotification } from "@/app/_hooks/groups/useToggleNotification";
import { useFocusNotification } from "@/app/_hooks/_websocket/notifications/useFocusNotification";
import { useQueryClient } from "@tanstack/react-query";
import { groupKeys } from "@/app/api/groups/keys";

type GroupNotiProps = {
  data: GroupDetail;
  isHost: boolean;
};

export default function GroupNoti({ data, isHost }: GroupNotiProps) {
  const [openNoti, setOpenNoti] = useState(false);
  const queryClient = useQueryClient();

  // 실시간 알림 설정 변경 감지 (현재 그룹 직접 구독)
  useFocusNotification({
    groupId: data.groupId,
    onNotification: (message) => {
      if (message.groupId === data.groupId) {
        // 알림 설정이 변경되었다는 메시지를 받으면 쿼리 무효화 -> 데이터 다시 받아옴
        queryClient.invalidateQueries({
          queryKey: groupKeys.notifications(data.groupId),
        });
      }
    },
  });

  const { notiData, localAgreed, handleToggle } = useToggleNotification(
    data.groupId,
    { refetchInterval: 3000 } // 3초마다 폴링하여 데이터 동기화 보장
  );


  return (
    <>
      <div className="flex flex-col h-full justify-center items-center bg-white px-8 py-6 rounded-2xl w-full">
        <h3 className="text-heading4-20SB text-black">집중 체크 알림</h3>
        {notiData ? (
          <>
            <div className="flex items-center gap-1 mt-4 mb-4">
              <p
                className={`text-heading2-28SB ${localAgreed ? "text-gray-800" : "text-gray-400"
                  }`}
              >
                {String(notiData.notificationCycle).padStart(2, "0")}
              </p>
              <p className="text-body1-16R text-gray-600">시간</p>

              {isHost && (
                <button onClick={() => setOpenNoti(true)} className="ml-1">
                  <Icon Svg={Edit} size={24} className="text-gray-600" />
                </button>
              )}
            </div>

            <div className="relative group">
              <ToggleButton
                checked={localAgreed}
                onChange={(e) => handleToggle(e.target.checked)}
                disabled={!isHost}
              />
              {!isHost && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-body2-14R rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  방장이 대표로 관리하고 있어요
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800" />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="mt-4 h-20 animate-pulse bg-gray-100 rounded-lg" />
        )}
      </div>

      {openNoti && notiData && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenNoti(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <NotiModal
              onClose={() => setOpenNoti(false)}
              groupId={data.groupId}
              initialData={{
                isAgreed: localAgreed,
                hours: notiData.notificationCycle,
                message: notiData.notificationMessage,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
