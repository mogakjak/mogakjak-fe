"use client";

import Image from "next/image";
import MemberProfile from "../../../../_components/home/room/memberProfile";
import CheerUp from "./cheerUp";
import GroupMemberState from "./groupMemberState";

type Status = "active" | "rest" | "end";

export interface GroupFriendFieldProps {
  status: Status;
  level: number;
  friendName?: string;
  isPublic?: boolean;
  activeTime?: number | null;
  task?: string;
  lastActiveAt?: Date | string | number;
  profileUrl?: string;
  isCurrentUser?: boolean;
  isHost?: boolean;
  cheerCount?: number;
  userId?: string;
  groupId?: string;
  onCheerClick?: (userId: string) => void;
  isLoading?: boolean;
}

export default function GroupFriendField({
  status,
  level,
  friendName = "가나디",
  isPublic = true,
  activeTime,
  task,
  lastActiveAt,
  profileUrl,
  isCurrentUser = false,
  isHost = false,
  cheerCount = 0,
  userId,
  onCheerClick,
  isLoading = false,
}: GroupFriendFieldProps) {
  const isActive = status === "end";

  const avatarSrc = isActive
    ? `/character/sleeping/sleepingLevel${level}.svg`
    : `/character/level${level}.svg`;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full animate-pulse">
        <div className="bg-white p-4 pt-3 rounded-t-xl w-[224px] h-[144px] border-2 border-gray-200 shrink-0">
          <section className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-gray-200" />
              <div className="flex items-center gap-1">
                <div className="w-12 h-4 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="w-12 h-6 bg-gray-200 rounded" />
          </section>

          <section className="flex mt-2 justify-center">
            <div className="w-[90px] h-[90px] rounded-full bg-gray-200 shrink-0" />
          </section>
        </div>

        <div className="w-[224px] rounded-b-xl px-3 py-2 border-2 border-gray-200 border-t-0 bg-gray-50 shrink-0">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 pt-3 rounded-t-xl w-[224px] h-[144px] border-2 border-gray-200 shrink-0">
        <section
          className={`flex items-center ${isActive ? "justify-start" : "justify-between"
            }`}
        >
          <div className="flex items-center gap-1">
            <MemberProfile isActive size="small" profileUrl={profileUrl} />
            <div className="flex items-center gap-1">
              <p
                className={`text-body2-14SB ${isActive && "text-gray-500"
                  } max-w-[70px] truncate`}
              >
                {friendName}
              </p>
              {isCurrentUser && (
                <span
                  className={`text-body2-14SB ${isActive && "text-gray-500"}`}
                >
                  (나)
                </span>
              )}
              {isHost && (
                <Image
                  src="/Icons/king.svg"
                  alt="방장"
                  width={20}
                  height={20}
                />
              )}
            </div>
          </div>
          {!isActive && !isCurrentUser && (
            <CheerUp
              cheerCount={cheerCount}
              onClick={() => {
                if (userId && onCheerClick) {
                  onCheerClick(userId);
                }
              }}
            />
          )}
        </section>

        <section className={`flex mt-2 justify-center`}>
          <div className="w-[90px] h-[90px] relative shrink-0">
            <Image
              src={avatarSrc}
              alt="토마토"
              width={90}
              height={90}
              priority
              loading="eager"
              fetchPriority="high"
              style={{ aspectRatio: "1 / 1" }}
              className="object-contain"
            />
          </div>
        </section>
      </div>

      <div
        className={`w-[224px] rounded-b-xl px-3 py-2 border-2 border-gray-200 border-t-0 bg-gray-50 shrink-0`}
      >
        <GroupMemberState
          status={status}
          isPublic={isPublic}
          activeTime={activeTime}
          task={task}
          lastActiveAt={lastActiveAt}
        />
      </div>
    </div>
  );
}
