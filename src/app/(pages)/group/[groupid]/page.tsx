"use client";

import { useRouter, useParams } from "next/navigation";
import PreviewMain from "@/app/_components/home/previewMain";
import GroupPage from "@/app/(pages)/group/_components/groupPage";
import Icon from "@/app/_components/common/Icons";
import Edit from "/Icons/edit.svg";

export default function GroupRoomPage() {
  const router = useRouter();
  const { groupId } = useParams<{ groupId: string }>();

  const handleExitGroup = () => {
    router.push("/");
  };

  return (
    <main className="w-full h-full max-w-[1440px] mx-auto flex flex-col gap-1 overflow-x-hidden pt-5">
      <div className="flex gap-1 px-6 mb-2">
        <p className="text-heading4-20SB">모각작 팀</p>
        <button>
          <Icon Svg={Edit} size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="w-full h-full flex gap-5">
        <div className="self-stretch">
          <PreviewMain state={true} />
        </div>

        <GroupPage onExitGroup={handleExitGroup} groupId={groupId} />
      </div>
    </main>
  );
}
