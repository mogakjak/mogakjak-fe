"use client";

import React from "react";
import { Button } from "@/components/button";
import { CheerNotification } from "@/app/_types/groups";
import Icon from "../common/Icons";
import CheerUp from "/Icons/cheerup.svg";

interface CheerNotificationModalProps {
  notification: CheerNotification;
  onClose: () => void;
}

export default function CheerNotificationModal({
  notification,
  onClose,
}: CheerNotificationModalProps) {



  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="flex flex-col w-[340px] bg-white rounded-xl shadow-lg">
        <div className="flex flex-col p-7 pt-8 text-center">
          <div className="flex justify-center mb-4">
            <Icon Svg={CheerUp} size={48} className="text-red-500" />
          </div>
          <h2 className="text-heading3-24SB text-gray-800 mb-2">
            {notification.fromUserNickname}님이 응원을 보냈어요!
          </h2>
          <p className="text-body1-16R text-gray-600">{notification.message}</p>
        </div>

        <div className="px-7 pb-7 flex gap-2">
          <Button
            onClick={onClose}
            leftIcon={null}
            className="flex-1 bg-gray-200 hover:bg-gray-300"
            variant="secondary"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
