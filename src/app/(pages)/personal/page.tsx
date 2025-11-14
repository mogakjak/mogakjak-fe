"use client";

import PersonalTimer from "../../_components/personal/personalTimer";

export default function PersonalTimerPage() {
  // 환경변수에서 사용자 ID를 가져오거나, 테스트를 위해 하드코딩
  // 실제로는 API에서 사용자 정보를 가져와야 함
  const userId =
    typeof window !== "undefined"
      ? parseInt(process.env.NEXT_PUBLIC_TEST_USER_ID || "1", 10)
      : 1;

  return (
    <div className="w-full max-w-[1440px] min-h-screen py-9 mx-auto flex justify-center items-start">
      <PersonalTimer userId={userId} />
    </div>
  );
}
