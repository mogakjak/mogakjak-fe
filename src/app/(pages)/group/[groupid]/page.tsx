"use client";

import { useRouter, useParams } from "next/navigation";
import PreviewMain from "@/app/_components/home/previewMain";
import GroupPage from "@/app/(pages)/group/_components/groupPage";
import Icon from "@/app/_components/common/Icons";
import Edit from "/Icons/edit.svg";
import { useGroupDetail } from "@/app/_hooks/groups";
import { useState } from "react";
import RoomModal from "@/app/_components/home/room/roomModal";

export default function GroupRoomPage() {
  const [groupEditOpen, setGroupEditOpen] = useState(false);
  const router = useRouter();
  const { groupId } = useParams<{ groupId: string }>();
  const { data, isPending } = useGroupDetail(groupId);

  const handleExitGroup = () => {
    router.push("/");
  };

  return (
    <main className="w-full h-full max-w-[1440px] mx-auto flex flex-col gap-1 overflow-x-hidden pt-5">
      <div className="flex gap-1 px-6 mb-2">
        <p className="text-heading4-20SB">{data?.name} 팀</p>
        <button onClick={() => setGroupEditOpen(true)}>
          <Icon Svg={Edit} size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="w-full h-full flex gap-5">
        <div className="self-stretch">
          <PreviewMain state={true} />
        </div>

        {isPending || !data ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-[560px] bg-gray-100 animate-pulse rounded-2xl" />
          </div>
        ) : (
          <GroupPage onExitGroup={handleExitGroup} groupData={data} />
        )}
      </div>

      {groupEditOpen && (
        <div className="z-[1000] fixed inset-0 bg-black/30 flex items-center justify-center">
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
