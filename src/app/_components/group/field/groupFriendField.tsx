"use client";

import React from "react";
import Image from "next/image";
import MemberProfile from "../../home/room/memberProfile";
import CheerUp from "./cheerUp";
import MessageBubble from "./messageBubble";
import GroupMemberState from "./groupMemberState";

type Status = "active" | "rest" | "end";

interface GroupFriendFieldProps {
  status: Status;
  friendName?: string;
  avatarSrc?: string;
  isPublic?: boolean;
  activeTime?: number;
}

export default function GroupFriendField({
  status,
  friendName = "가나디",
  avatarSrc = "/character/tomato.svg",
  isPublic = true,
  activeTime = 0,
}: GroupFriendFieldProps) {
  const [friendMsg, setFriendMsg] = React.useState("");

  const isActive = status === "end";

  return (
    <div className="flex flex-col gap-0.5">
      <div className="bg-white p-4 pt-3 rounded-t-xl w-[253px] h-[168px]">
        <section
          className={`flex items-center ${
            isActive ? "justify-start" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-1">
            <MemberProfile isActive size="small" />
            <p className={`text-body2-14SB ${isActive && "text-gray-500"}`}>
              {friendName}
            </p>
          </div>
          {!isActive && <CheerUp />}
        </section>

        <section
          className={`flex mt-5 ${
            isActive ? "justify-center" : "justify-between"
          }`}
        >
          <Image src={avatarSrc} alt="토마토" width={70} height={70} />
          {!isActive && (
            <MessageBubble
              type="friend"
              value={friendMsg}
              onChange={setFriendMsg}
            />
          )}
        </section>
      </div>

      <div
        className={` rounded-b-xl px-5 py-3 ${
          isActive ? "bg-gray-200" : "bg-red-50"
        }`}
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
