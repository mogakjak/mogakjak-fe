"use client";

import PreviewMain from "./previewMain";
import FriendMain from "./friendMain";
import RoomMain from "./roomMain";
import { useMyGroups } from "@/app/_hooks/groups/useMyGroups";
import { useOnboarding } from "@/app/_hooks/users/useOnboarding";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { data: onboarding } = useOnboarding();
  const { data: groups = [], isPending: isGroupsPending } = useMyGroups();

  useEffect(() => {
    const isLocalOnboardingDone =
      typeof window !== "undefined" &&
      window.localStorage.getItem("mg_onboarded_v1") === "true";

    if (onboarding && onboarding.isFirstVisit === true && !isLocalOnboardingDone) {
      router.push("/onboarding");
    }
  }, [onboarding, router]);

  const isLocalOnboardingDone =
    typeof window !== "undefined" &&
    window.localStorage.getItem("mg_onboarded_v1") === "true";

  // 온보딩 체크 중이거나 첫 방문인 경우 (로컬 완료가 안된 경우만) 화면을 그리지 않음
  if (onboarding && onboarding.isFirstVisit === true && !isLocalOnboardingDone)
    return null;
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
