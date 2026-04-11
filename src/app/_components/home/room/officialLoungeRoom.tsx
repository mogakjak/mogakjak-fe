"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Members from "./members";
import MembersHover from "./membersHover";
import { Button } from "@/components/button";
import AlertModal from "@/app/_components/common/timer/alertModal";
import { useEnterOfficialLounge } from "@/app/_hooks/lounge/useEnterOfficialLounge";
import { loungeKeys } from "@/app/api/lounge/keys";
import { groupKeys } from "@/app/api/groups/keys";
import type { MyGroup } from "@/app/_types/groups";

type OfficialLoungeRoomProps = {
  group: MyGroup;
};

export default function OfficialLoungeRoom({ group }: OfficialLoungeRoomProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const enterMutation = useEnterOfficialLounge();
  const [blockedOpen, setBlockedOpen] = useState(false);

  const members = group.members.map((member) => ({
    ...member,
    isActive: member.participationStatus === "PARTICIPATING",
  }));
  const currentCount = group.currentMemberCount ?? members.length;
  const maxCount = group.maxMemberCount ?? 20;

  const handleEnter = async () => {
    try {
      const next = await enterMutation.mutateAsync();
      queryClient.setQueryData(loungeKeys.summary(), next);
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
      router.push("/lounge?entered=1");
    } catch (error) {
      const err = error as Error & { status?: number };
      const isFull =
        err.status === 409 ||
        err.message.includes("열기로 가득") ||
        err.message.includes("공식 라운지");

      if (isFull) {
        setBlockedOpen(true);
        return;
      }

      console.error("공식 라운지 입장 실패:", error);
    }
  };

  const isValidImageUrl =
    group.imageUrl &&
    (group.imageUrl.startsWith("/") ||
      group.imageUrl.startsWith("http://") ||
      group.imageUrl.startsWith("https://"));

  return (
    <div className="flex items-center border-b border-gray-200 px-5 py-4 bg-red-50/40">
      <div className="relative w-[84px] h-[84px] rounded-lg bg-white overflow-hidden border border-red-100">
        {isValidImageUrl ? (
          <Image
            src={group.imageUrl as string}
            alt="officialLoungeImage"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-red-50 to-orange-50">
            <Image src="/logo.svg" alt="official lounge" width={42} height={42} />
          </div>
        )}
        <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
          OFFICIAL
        </div>
      </div>

      <div className="flex flex-col gap-2 ml-5">
        <div className="flex items-center gap-2">
          <p className="text-heading4-20SB text-black">{group.groupName}</p>
          <span className="rounded-full bg-red-100 text-red-500 px-2 py-1 text-caption-12SB">
            공용 광장
          </span>
        </div>
        <p className="text-body2-14R text-gray-600">
          {currentCount}명 함께 몰입 중입니다
        </p>
      </div>

      <div className="flex items-center ml-auto gap-9">
        <div className="flex items-center gap-4">
          <MembersHover
            members={members}
            activeCount={currentCount}
            trigger={
              <Members
                members={members.map((member) => ({
                  id: member.userId,
                  isActive: true,
                  profileUrl: member.profileUrl,
                }))}
                size="default"
              />
            }
          />
          <span className="text-body1-16R text-gray-700">
            {currentCount}/{maxCount} 명
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleEnter}
          disabled={enterMutation.isPending}
          className="min-w-[110px]"
        >
          {enterMutation.isPending ? "입장 중" : "라운지 입장"}
        </Button>
      </div>

      <AlertModal
        isOpen={blockedOpen}
        onClose={() => setBlockedOpen(false)}
        type="officialLoungeFull"
      />
    </div>
  );
}
