"use client";

import { useProfile } from "@/app/_hooks/mypage/useProfile";

export default function GroupQuote() {
  const { data: profile, isPending } = useProfile();
  const content = profile?.quote?.content?.trim();

  return (
    <div className="flex h-full min-w-0 flex-col gap-3 rounded-2xl bg-white px-8 py-5">
      <h3 className="text-heading4-20SB text-black">오늘의 한마디</h3>
      <div className="flex h-[108px] flex-1 items-center justify-center overflow-y-auto rounded-2xl border border-gray-200 bg-gray-100 px-10 py-8 text-gray-700">
        <p className="text-center text-body1-16R leading-7">
          {isPending
            ? "명언을 불러오는 중이에요."
            : content || "오늘의 한마디가 아직 없어요."}
        </p>
      </div>
    </div>
  );
}
