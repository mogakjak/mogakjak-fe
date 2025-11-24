"use client";

import { useEffect, useState, useRef } from "react";
import { formatTime } from "@/app/_utils/formatTime";
import Icon from "../../../../_components/common/Icons";

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
  activeTime?: number | null;
  restTime?: number;
  activeSec?: number;
  breakSec?: number;
  lastActiveAt?: Date | string | number;
}

export default function GroupMemberState({
  status,
  task,
  activeTime,
  lastActiveAt,
}: GroupMemberStateProps) {
  // activeTime 계산
  // activeTime이 null이거나 undefined이면 시간 표시를 하지 않음
  // activeTime이 0이면 실제로 0초인 경우이므로 시간 표시
  const serverActiveTime =
    activeTime !== null && activeTime !== undefined ? toSec(activeTime) : 0;
  const serverLastActiveAt = useRef<Date | null>(null);

  // 서버에서 받은 lastActiveAt을 Date로 변환하여 저장
  useEffect(() => {
    if (lastActiveAt) {
      const last =
        typeof lastActiveAt === "string" || typeof lastActiveAt === "number"
          ? new Date(lastActiveAt)
          : lastActiveAt;
      serverLastActiveAt.current = last;
    }
  }, [lastActiveAt]);

  // 클라이언트에서 추적하는 활성 시간 (서버 신호와 동기화)
  const [clientActiveTime, setClientActiveTime] = useState(serverActiveTime);
  const [serverSyncTime, setServerSyncTime] = useState(Date.now());

  // 서버에서 받은 activeTime이 변경되면 동기화
  // activeTime이 null이거나 undefined이면 동기화하지 않음
  useEffect(() => {
    if (
      (status === "active" || status === "rest") &&
      activeTime !== null &&
      activeTime !== undefined
    ) {
      setClientActiveTime(serverActiveTime);
      setServerSyncTime(Date.now());
    }
  }, [serverActiveTime, status, activeTime]);

  // active 상태일 때만 클라이언트에서 시간 증가 (rest는 휴식이므로 증가하지 않음)
  // activeTime이 null이거나 undefined이면 시간 증가하지 않음
  useEffect(() => {
    if (
      status !== "active" ||
      activeTime === null ||
      activeTime === undefined
    ) {
      return;
    }

    const interval = setInterval(() => {
      setClientActiveTime(() => {
        // 서버에서 받은 시간 + 경과 시간 (초 단위)
        const elapsedSeconds = Math.floor((Date.now() - serverSyncTime) / 1000);
        return serverActiveTime + elapsedSeconds;
      });
    }, 1000); // 1초마다 업데이트

    return () => clearInterval(interval);
  }, [status, serverActiveTime, serverSyncTime, activeTime]);

  // lastActiveAt으로부터 경과 시간 계산 (end 상태일 때)
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

    // 즉시 업데이트
    updateElapsedTime();

    // 1분마다 업데이트
    const interval = setInterval(updateElapsedTime, 60000);

    return () => clearInterval(interval);
  }, [status, lastActiveAt]);

  // active 상태일 때만 증가하는 시간 사용, rest/end는 서버에서 받은 정적 시간 사용
  // activeTime이 null이거나 undefined이면 0 사용 (표시하지 않음)
  const effectiveActive =
    activeTime !== null && activeTime !== undefined
      ? status === "active"
        ? clientActiveTime
        : serverActiveTime
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

  // 할 일 제목 표시 (task가 없으면 "뭔가 하는 중")
  const line1 =
    status === "active"
      ? task
        ? `"${task}" 하는 중`
        : "뭔가 하는 중"
      : status === "rest"
      ? "잠시 쉬어갈래요"
      : "몰입에 참여하지 않았어요";

  // 누적 시간 표시
  // activeTime이 null이거나 undefined이면 비공개로 간주하여 "참여 중" 등으로 표시
  // 백엔드에서 isTimerPublic이 false이면 null을 보내므로, null이면 "참여 중" 표시
  // activeTime이 0이면서 status가 active인 경우는 실제로 0초인 경우이므로 시간 표시
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
          className={`${
            status == "active"
              ? "text-black"
              : status == "rest"
              ? "text-gray-600 "
              : "text-gray-500"
          }`}
        />
        <p
          className={`truncate ${
            status == "active"
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
        className={`flex items-center gap-2 ${
          status == "active" ? "text-black" : "text-gray-400"
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

function toSec(x: number): number {
  if (x > 100_000) return Math.floor(x / 1000);
  return Math.floor(x);
}
