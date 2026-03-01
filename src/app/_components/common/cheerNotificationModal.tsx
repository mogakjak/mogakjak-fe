"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);



  if (!mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="flex w-[340px] flex-col rounded-xl bg-white shadow-lg">
        <div className="flex flex-col p-7 pt-8 text-center">
          <div className="mb-4 flex justify-center">
            <Icon Svg={CheerUp} size={48} className="text-red-500" />
          </div>
          <h2 className="text-heading3-24SB mb-2 text-gray-800">
            {notification.fromUserNickname}님이 응원을 보냈어요!
          </h2>
          <p className="text-body1-16R text-gray-600">
            {notification.message}
          </p>
        </div>

        <div className="flex gap-2 px-7 pb-7">
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

  return createPortal(content, document.body);
}
