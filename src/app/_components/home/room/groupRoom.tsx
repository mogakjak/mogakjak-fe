"use client";

import Members from "./members";
import StateButton from "./stateButton";
import HomeButton from "./homeButton";
import MembersHover from "./membersHover";
import Image from "next/image";
import { MyGroup } from "@/app/_types/groups";
import { useRouter } from "next/navigation";

type GroupRoomProps = {
  group: MyGroup;
};

export default function GroupRoom({ group }: GroupRoomProps) {
  const router = useRouter();
  const { groupId, groupName, imageUrl, members } = group;

  const activeCount = members.length;
  const totalCount = members.length;

  const handleEnter = () => {
    router.push(`/group/${groupId}`);
  };

  return (
    <div className="flex items-center border-b border-gray-200 px-5 py-4">
      <div className="relative w-[84px] h-[84px] rounded-lg bg-red-200 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="groupImage"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Image src="/favicon.svg" alt="groupImage" width={40} height={40} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 ml-5">
        <p className="text-heading4-20SB text-black">{groupName}</p>
        <StateButton state={true} />
      </div>

      <div className="flex items-center ml-auto gap-9">
        <div className="flex items-center gap-4">
          <MembersHover
            members={members}
            activeCount={activeCount}
            trigger={
              <Members
                members={members.map((m) => ({
                  id: m.userId,
                  isActive: true,
                  profileUrl: m.profileUrl,
                }))}
                size="default"
              />
            }
          />
          <span className="text-body1-16R text-gray-700">
            {activeCount}/{totalCount} 명
          </span>
        </div>
        <HomeButton variant="primary" onClick={handleEnter}>
          참여하기
        </HomeButton>
      </div>
    </div>
  );
}
