"use client";

import { useState } from "react";
import Icon from "../../../../_components/common/Icons";
import Edit from "/Icons/edit.svg";
import NotiModal from "../../../../_components/group/modal/notiModal";
import { GroupDetail } from "@/app/_types/groups";
import ToggleButton from "@/app/_components/group/modal/toggleButton";
import { useToggleNotification } from "@/app/_hooks/groups/useToggleNotification";

type GroupNotiProps = {
  data: GroupDetail;
  isHost: boolean;
  isOnboarding?: boolean;
};

const getCycleLabel = (hours: number) =>
  hours === 1 ? "매 시 정각" : `${hours}시간마다`;

export default function GroupNoti({
  data,
  isHost,
  isOnboarding,
}: GroupNotiProps) {
  const [openNoti, setOpenNoti] = useState(false);
  const { notiData, localEnabled, handleToggle, isReady } =
    useToggleNotification(data.groupId);

  const notificationCycle = isOnboarding
    ? 1
    : notiData?.notificationCycle;
  const displayEnabled = isOnboarding ? true : localEnabled;

  return (
    <>
      <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-white px-8 py-5">
        <h3 className="text-heading4-20SB text-black">집중 체크 알림</h3>
        {isOnboarding || (isReady && notificationCycle) ? (
          <>
            <div className="mt-5 flex items-center gap-1">
              <p className="text-center text-heading2-28SB text-black">
                {getCycleLabel(notificationCycle ?? 1)}
              </p>
              {isHost && !isOnboarding && (
                <button
                  type="button"
                  onClick={() => setOpenNoti(true)}
                  className="ml-1"
                  aria-label="집중 체크 주기 설정"
                >
                  <Icon Svg={Edit} size={24} className="text-gray-600" />
                </button>
              )}
            </div>
            <div className="mt-5 flex w-full justify-center">
              <ToggleButton
                checked={displayEnabled}
                onChange={(event) => handleToggle(event.target.checked)}
                disabled={isOnboarding}
              />
            </div>
          </>
        ) : (
          <div className="mt-4 h-20 w-full animate-pulse rounded-lg bg-gray-100" />
        )}
      </div>

      {openNoti && notificationCycle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setOpenNoti(false)}
        >
          <div className="relative" onClick={(event) => event.stopPropagation()}>
            <NotiModal
              onClose={() => setOpenNoti(false)}
              groupId={data.groupId}
              initialData={{ hours: notificationCycle }}
            />
          </div>
        </div>
      )}
    </>
  );
}
