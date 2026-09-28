"use client";

import HomeProfileCard from "./v2/homeProfileCard";
import HomeMateCard from "./v2/mate/homeMateCard";
import HomeLoungeCard from "./v2/lounge/homeLoungeCard";
import HomeGroupSection from "./v2/group/homeGroupSection";
import { useOnboardingRedirect } from "@/app/_hooks/users/useOnboardingRedirect";

export default function HomePage() {
  const { shouldRender } = useOnboardingRedirect();

  // 온보딩 체크 중이거나 첫 방문인 경우 화면을 그리지 않음 (리다이렉트 대기)
  if (!shouldRender) return null;
  return (
    <main className="w-full h-full max-w-[1440px] mx-auto flex gap-5 overflow-x-hidden pt-9">
      <aside className="w-[300px] min-w-[300px] flex flex-col gap-5">
        <HomeProfileCard />
        <HomeMateCard />
      </aside>

      <section className="flex-1 min-w-0 flex flex-col gap-5">
        <HomeLoungeCard />
        <HomeGroupSection />
      </section>
    </main>
  );
}
