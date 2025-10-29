"use client";

import { formatTime } from "@/app/_utils/formatTime";
import Icon from "../../common/Icons";

// 아이콘
import Book from "/Icons/book.svg";
import Sleep from "/Icons/sleep.svg";
import Empty from "/Icons/empty.svg";
import StopWatch from "/Icons/stopwatch.svg";
type MemberStatus = "active" | "rest" | "end";

interface GroupMemberStateProps {
  status: MemberStatus;
  isPublic: boolean;
  task?: string;
  activeTime?: number;
  restTime?: number;
  activeSec?: number;
  breakSec?: number;
  lastActiveAt?: Date | string | number;
}

export default function GroupMemberState({
  status,
  isPublic,
  task,
  activeTime,
  activeSec,
  lastActiveAt,
}: GroupMemberStateProps) {
  const effectiveActive = toSec(activeTime ?? activeSec ?? 0);

  const now = new Date();
  const last =
    typeof lastActiveAt === "string" || typeof lastActiveAt === "number"
      ? new Date(lastActiveAt)
      : lastActiveAt ?? now;

  const diffMin = Math.max(
    0,
    Math.floor((now.getTime() - last.getTime()) / 60000)
  );
  const diffDay = Math.floor(diffMin / 1440);

  const statusIcon =
    status === "active" ? Book : status === "rest" ? Sleep : Empty;

  const line1 =
    status === "active"
      ? `"${task ?? "가나다라마바사"}" 하는 중`
      : status === "rest"
      ? "잠시 쉬어갈래요"
      : "몰입에 참여하지 않았어요";

  const line2 = isPublic
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
      <p
        className={`flex items-center gap-2 ${
          status == "active"
            ? "text-black"
            : status == "rest"
            ? "text-gray-600 "
            : "text-gray-500"
        }`}
      >
        <Icon
          Svg={statusIcon}
          size={20}
          className={`${
            status == "active"
              ? "text-black"
              : status == "rest"
              ? "text-gray-600 "
              : "text-gray-500"
          }`}
        />
        {line1}
      </p>
      <p
        className={`flex items-center gap-2 ${
          status == "active"
            ? "text-red-500"
            : status == "rest"
            ? "text-red-300 "
            : "text-gray-400"
        }`}
      >
        <Icon
          Svg={StopWatch}
          size={20}
          className={`${
            status == "active"
              ? "text-red-500"
              : status == "rest"
              ? "text-red-300 "
              : "text-gray-400"
          }`}
        />
        {line2}
      </p>
    </div>
  );
}

function toSec(x: number): number {
  if (x > 100_000) return Math.floor(x / 1000);
  return Math.floor(x);
}
