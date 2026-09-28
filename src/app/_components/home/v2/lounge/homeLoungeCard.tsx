"use client";

import Image from "next/image";
import Members from "../../room/members";
import MembersHover from "../../room/membersHover";
import HomeButton from "../../room/homeButton";
import AlertModal from "@/app/_components/common/timer/alertModal";
import type { MyGroup } from "@/app/_types/groups";
import { useOfficialLoungeSummary } from "@/app/_hooks/lounge/useOfficialLoungeSummary";
import { useOfficialLoungePresenceSubscription } from "@/app/_hooks/lounge/useOfficialLoungePresenceSubscription";
import { useGroupRowActions } from "@/app/_hooks/groups/useGroupRowActions";

const LOUNGE_CHARACTERS = [
  { src: "/character/tomato.svg", alt: "토마토 캐릭터" },
  { src: "/character/level8.svg", alt: "오렌지 캐릭터" },
  { src: "/character/level12.svg", alt: "레몬 캐릭터" },
];

export default function HomeLoungeCard() {
  const { data: lounge } = useOfficialLoungeSummary({ refetchInterval: 3000 });

  useOfficialLoungePresenceSubscription({ enabled: Boolean(lounge?.groupId) });

  if (!lounge) {
    return (
      <div className="w-full h-[228px] shrink-0 bg-white rounded-[20px] px-9 py-7 animate-pulse">
        <div className="h-6 w-28 bg-gray-200 rounded" />
        <div className="mt-8 flex items-center gap-6">
          <div className="w-[240px] h-[100px] bg-gray-100 rounded-2xl" />
          <div className="flex-1 flex flex-col gap-3">
            <div className="h-7 w-1/2 bg-gray-200 rounded" />
            <div className="h-4 w-2/3 bg-gray-100 rounded" />
          </div>
          <div className="w-[180px] h-[68px] bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return <HomeLoungeCardContent lounge={lounge} />;
}

function HomeLoungeCardContent({ lounge }: { lounge: MyGroup }) {
  const {
    sortedMembersWithStatus,
    activeCount,
    totalCount,
    handleEnter,
    isEnterBusy,
    blockedOpen,
    closeBlocked,
  } = useGroupRowActions(lounge);

  const currentCount = lounge.currentMemberCount ?? activeCount;
  const maxCount = lounge.maxMemberCount ?? totalCount;

  return (
    <div className="w-full h-[228px] shrink-0 bg-white rounded-[20px] px-9 py-7 flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-heading4-20SB text-black">공식 라운지</h2>
        <div className="flex items-center gap-4">
          {sortedMembersWithStatus.length > 0 && (
            <MembersHover
              members={sortedMembersWithStatus}
              activeCount={activeCount}
              trigger={
                <Members
                  members={sortedMembersWithStatus.map((m) => ({
                    id: m.userId,
                    isActive: m.isActive ?? false,
                    profileUrl: m.profileUrl,
                  }))}
                  size="default"
                />
              }
            />
          )}
          <span className="text-body1-16R text-gray-700 whitespace-nowrap">
            {currentCount}/{maxCount} 명
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-8">
        <div className="flex items-end shrink-0">
          {LOUNGE_CHARACTERS.map(({ src, alt }, idx) => (
            <Image
              key={src}
              src={src}
              alt={alt}
              width={84}
              height={100}
              className={idx === 0 ? "h-[100px] w-auto" : "-ml-3 h-[100px] w-auto"}
            />
          ))}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <p className="text-heading2-28SB text-black">
            지금 <span className="text-red-500">{currentCount}명</span>이 몰입 중
          </p>
          <p className="text-body2-14R text-gray-500 break-keep">
            당장 함께 몰입할 친구가 없다면? 기다릴 필요 없이, 바로 입장할 수 있어요 →
          </p>
        </div>

        <HomeButton
          variant="primary"
          className="w-[180px]! shrink-0"
          onClick={() => {
            void handleEnter();
          }}
          disabled={isEnterBusy}
        >
          {isEnterBusy ? "참여 중" : "공식라운지 참여하기"}
        </HomeButton>
      </div>

      <AlertModal
        isOpen={blockedOpen}
        onClose={closeBlocked}
        type="officialLoungeFull"
      />
    </div>
  );
}
