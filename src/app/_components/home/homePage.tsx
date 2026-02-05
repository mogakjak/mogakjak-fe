"use client";

import PreviewMain from "./previewMain";
import FriendMain from "./friendMain";
import RoomMain from "./roomMain";
import { useMyGroups } from "@/app/_hooks/groups/useMyGroups";
import { useOnboardingRedirect } from "@/app/_hooks/users/useOnboardingRedirect";

export default function HomePage() {
  const { shouldRender } = useOnboardingRedirect();
  const { data: groups = [], isPending: isGroupsPending } = useMyGroups();

  // 온보딩 체크 중이거나 첫 방문인 경우 화면을 그리지 않음 (리다이렉트 대기)
  if (!shouldRender) return null;
  return (
    <main className="w-full h-full max-w-[1440px] mx-auto flex gap-5 overflow-x-hidden pt-9">
      <div className="self-stretch">
        <PreviewMain state={false} />
      </div>

      <section className="w-full flex-1 flex flex-col gap-5">
        <RoomMain isPending={isGroupsPending} />
        <FriendMain groups={groups} />
      </section>
    </main>
  );
}
