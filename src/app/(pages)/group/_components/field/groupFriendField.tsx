"use client";

import React from "react";
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
  activeTime?: number;
  profileUrl?: string;
}

export default function GroupFriendField({
  status,
  level,
  friendName = "가나디",
  isPublic = true,
  activeTime = 0,
  profileUrl,
}: GroupFriendFieldProps) {
  const isActive = status === "end";

  const avatarSrc = isActive
    ? `/character/sleeping/sleepingLevel${level}.svg`
    : `/character/level${level}.svg`;

  return (
    <div className="flex flex-col">
      <div className="bg-white p-4 pt-3 rounded-t-xl w-[224px] h-[144px] border-2 border-gray-200">
        <section
          className={`flex items-center ${
            isActive ? "justify-start" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-1">
            <MemberProfile isActive size="small" profileUrl={profileUrl} />
            <p className={`text-body2-14SB ${isActive && "text-gray-500"}`}>
              {friendName}
            </p>
          </div>
          {!isActive && <CheerUp />}
        </section>

        <section className={`flex mt-2 justify-center`}>
          <Image src={avatarSrc} alt="토마토" width={90} height={90} />
        </section>
      </div>

      <div
        className={`w-[224px] rounded-b-xl px-3 py-2 border-2 border-gray-200 border-t-0 bg-gray-50`}
      >
        <GroupMemberState
          status={status}
          isPublic={isPublic}
          activeTime={activeTime}
        />
      </div>
    </div>
  );
}
