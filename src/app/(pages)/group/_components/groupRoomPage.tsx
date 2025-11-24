"use client";

import { useRouter } from "next/navigation";
import PreviewMain from "@/app/_components/home/previewMain";
import GroupPage from "@/app/(pages)/group/_components/groupPage";
import Icon from "@/app/_components/common/Icons";
import Edit from "/Icons/edit.svg";
import { useGroupDetail } from "@/app/_hooks/groups/useGroupDetail";
import { useState } from "react";
import RoomModal from "@/app/_components/home/room/roomModal";

type GroupRoomPageProps = {
  groupid: string;
};

export default function GroupRoomPage({ groupid }: GroupRoomPageProps) {
  const [groupEditOpen, setGroupEditOpen] = useState(false);
  const router = useRouter();

  // 그룹 아이디 확인
  const validGroupId = groupid && groupid !== "undefined" ? groupid : "";
  const { data, isPending } = useGroupDetail(validGroupId, {
    enabled: !!validGroupId,
  });

  const handleExitGroup = () => {
    router.push("/");
  };

  return (
    <main className="w-full h-full max-w-[1440px] mx-auto flex flex-col gap-1 overflow-x-hidden pt-5">
      <div className="flex gap-1 px-6 mb-2">
        {isPending ? (
          <div className="flex items-center gap-2">
            <div className="h-6 w-40 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-5 w-5 bg-gray-200 rounded-md animate-pulse" />
          </div>
        ) : (
          <>
            <p className="text-heading4-20SB">{data?.name} 팀</p>
            <button onClick={() => setGroupEditOpen(true)}>
              <Icon Svg={Edit} size={20} className="text-gray-600" />
            </button>
          </>
        )}
      </div>

      <div className="w-full h-full flex gap-5">
        <div className="self-stretch">
          <PreviewMain state={true} groupId={validGroupId} />
        </div>

        {isPending || !data ? (
          <div className="w-full h-full bg-white animate-pulse rounded-2xl" />
        ) : (
          <GroupPage onExitGroup={handleExitGroup} groupData={data} />
        )}
      </div>

      {groupEditOpen && (
        <div className="z-50 fixed inset-0 bg-black/30 flex items-center justify-center">
          <RoomModal
            mode="edit"
            groupId={data?.groupId}
            initialName={data?.name}
            initialImageUrl={data?.imageUrl}
            onClose={() => setGroupEditOpen(false)}
          />
        </div>
      )}
    </main>
  );
}
