"use client";

import Members from "./members";
import StateButton from "./stateButton";
import HomeButton from "./homeButton";
import MembersHover from "./membersHover";
import Image from "next/image";

type Member = { id: number; isActive: boolean };
type Group = { id: number; name: string; members: Member[] };

type GroupRoomProps = { variant?: "data"; group: Group } | { variant: "guide" };

export default function GroupRoom(props: GroupRoomProps) {
  const isGuide = props.variant === "guide";

  const title = isGuide
    ? "[가이드] 모각작 그룹을 둘러보세요!"
    : props.group.name;

  const members = isGuide ? [] : props.group.members;
  const activeCount = isGuide ? 0 : members.filter((m) => m.isActive).length;
  const totalCount = isGuide ? 0 : members.length;
  const buttonText = isGuide ? "가이드 보기" : "참여하기";
  const stateOn = isGuide ? true : activeCount > 0;

  return (
    <div className="flex items-center border-b border-gray-200 px-5 py-4">
      <div className="w-[84px] h-[84px] rounded-lg bg-red-200 flex items-center justify-center">
        <Image src="/favicon.svg" alt="groupDefault" width={40} height={40} />
      </div>

      <div className="flex flex-col gap-2 ml-5">
        <p className="text-heading4-20SB text-black">{title}</p>
        <StateButton state={stateOn} />
      </div>

      <div className="flex items-center ml-auto gap-9">
        <div className="flex items-center gap-4">
          {isGuide ? (
            <Members members={members} size="default" isGuide />
          ) : (
            <MembersHover
              members={members}
              activeCount={activeCount}
              trigger={<Members members={members} size="default" />}
            />
          )}
          <span className="text-body1-16R text-gray-700">
            {isGuide ? "n/n" : `${activeCount}/${totalCount}`} 명
          </span>
        </div>
        <HomeButton variant={isGuide ? "secondary" : "primary"}>
          {buttonText}
        </HomeButton>
      </div>
    </div>
  );
}
