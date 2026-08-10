"use client";

import { useEffect, useState, useRef } from "react";
import { formatTime } from "@/app/_utils/formatTime";
import { useLiveTimer } from "@/app/_hooks/timers/useLiveTimer";
import Icon from "../../../../_components/common/Icons";

import Book from "/Icons/book.svg";
import Sleep from "/Icons/sleep.svg";
import Empty from "/Icons/empty.svg";
import StopWatch from "/Icons/stopwatch.svg";
type MemberStatus = "active" | "rest" | "end";

interface GroupMemberStateProps {
  status: MemberStatus;
  isPublic: boolean;
  task?: string;
  activeTime?: number | null;
  todoId?: string;
  disableLiveTick?: boolean;
  restTime?: number;
  activeSec?: number;
  breakSec?: number;
  lastActiveAt?: Date | string | number;
}

export default function GroupMemberState({
  status,
  task,
  activeTime,
  todoId,
  disableLiveTick = false,
  lastActiveAt,
}: GroupMemberStateProps) {
  const serverActiveTime =
    activeTime !== null && activeTime !== undefined
      ? Math.max(0, Math.floor(activeTime))
      : 0;
  const serverLastActiveAt = useRef<Date | null>(null);

  useEffect(() => {
    if (lastActiveAt) {
      const last =
        typeof lastActiveAt === "string" || typeof lastActiveAt === "number"
          ? new Date(lastActiveAt)
          : lastActiveAt;
      serverLastActiveAt.current = last;
    }
  }, [lastActiveAt]);

  const clientActiveTime = useLiveTimer({
    serverSeconds: serverActiveTime,
    isRunning:
      !disableLiveTick &&
      status === "active" &&
      activeTime !== null &&
      activeTime !== undefined,
    refreshKey: todoId,
  });

  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    if (status !== "end" || !serverLastActiveAt.current) {
      return;
    }

    const updateElapsedTime = () => {
      const now = new Date();
      const last = serverLastActiveAt.current;
      if (last) {
        const diffMin = Math.max(
          0,
          Math.floor((now.getTime() - last.getTime()) / 60000)
        );
        setElapsedMinutes(diffMin);
      }
    };

    updateElapsedTime();

    const interval = setInterval(updateElapsedTime, 60000);

    return () => clearInterval(interval);
  }, [status, lastActiveAt]);

  const effectiveActive =
    activeTime !== null && activeTime !== undefined
      ? disableLiveTick || status !== "active"
        ? serverActiveTime
        : clientActiveTime
      : 0;

  const now = new Date();
  const last =
    serverLastActiveAt.current ??
    (typeof lastActiveAt === "string" || typeof lastActiveAt === "number"
      ? new Date(lastActiveAt)
      : lastActiveAt ?? now);

  const diffMin =
    status === "end"
      ? elapsedMinutes
      : Math.max(0, Math.floor((now.getTime() - last.getTime()) / 60000));
  const diffDay = Math.floor(diffMin / 1440);

  const statusIcon =
    status === "active" ? Book : status === "rest" ? Sleep : Empty;

  const line1 =
    status === "active"
      ? task
        ? `"${task}" 하는 중`
        : "뭔가 하는 중"
      : status === "rest"
        ? "잠시 쉬어갈래요"
        : "몰입에 참여하지 않았어요";

  const hasActiveTime = activeTime !== null && activeTime !== undefined;

  const line2 = hasActiveTime
    ? status === "end"
      ? `최근 참여시간 ${diffMin}분전`
      : `${formatTime(effectiveActive)}`
    : status === "active"
      ? "참여 중"
      : status === "rest"
        ? "휴식 중"
        : `최근 참여시간 ${diffDay}일전`;

  return (
    <div className="flex flex-col text-body2-14SB gap-1">
      <div className="flex items-center gap-2">
        <Icon
          Svg={statusIcon}
          size={20}
          className={`${status == "active"
            ? "text-black"
            : status == "rest"
              ? "text-gray-600 "
              : "text-gray-500"
            }`}
        />
        <p
          title={line1}
          className={`truncate ${status == "active"
            ? "text-black"
            : status == "rest"
              ? "text-gray-600 "
              : "text-gray-500"
            }`}
        >
          {line1}
        </p>
      </div>
      <p
        className={`flex items-center gap-2 ${status == "active" ? "text-black" : "text-gray-400"
          }`}
      >
        <Icon
          Svg={StopWatch}
          size={20}
          className={`${status == "active" ? "text-black" : "text-gray-400"}`}
        />
        {line2}
      </p>
    </div>
  );
}
