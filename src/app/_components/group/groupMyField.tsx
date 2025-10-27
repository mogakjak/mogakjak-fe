"use client";

import React from "react";
import MessageBubble from "./messageBubble";
import Image from "next/image";
import MemberProfile from "../room/memberProfile";
import CheerUp from "./cheerUp";

export default function GroupMyField() {
  const [meMsg, setMeMsg] = React.useState("");

  return (
    <div className="flex flex-col bg-white rounded-2xl p-4 w-[238px] h-[262px]">
      <section className="flex flex-col gap-5 items-center">
        <MessageBubble type="me" value={meMsg} onChange={setMeMsg} />
        <Image
          src="/character/tomato.svg"
          alt="토마토"
          width={80}
          height={80}
        />
      </section>

      <section className="flex justify-between items-center mt-auto">
        <div className="flex items-center gap-1">
          <MemberProfile isActive size="small" />
          <p className="text-body2-14SB text-black">가나디(나)</p>
        </div>
        <CheerUp />
      </section>
    </div>
  );
}
