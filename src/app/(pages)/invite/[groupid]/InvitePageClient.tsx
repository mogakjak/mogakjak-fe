"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useJoinGroup } from "@/app/_hooks/groups/useJoinGroup";
import { groupKeys } from "@/app/api/groups/keys";
import MobileHomePage from "@/app/_components/home/mobileHomePage";

export default function InvitePageClient({
  groupid,
  groupName,
}: {
  groupid: string;
  groupName: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMobile, setIsMobile] = useState(false);

  const { mutate: joinGroup, isPending, isSuccess } = useJoinGroup();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      const isMobileDevice =
        /iPhone|iPad|iPod|Android|Mobile|Windows Phone/i.test(ua);
      setIsMobile(isMobileDevice);

      // 모바일이 아니면 초대 페이지가 아니라 바로 홈으로 이동
      if (!isMobileDevice) {
        router.push("/");
      }
    }
  }, [router]);

  useEffect(() => {
    if (!groupid) return;

    joinGroup(groupid, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: groupKeys.my() });
        queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupid) });
      },
      onError: (err) => {
        console.error("그룹 가입 실패:", err);
      },
    });
  }, [groupid, joinGroup, queryClient]);

  // 모바일에서는 항상 초대 안내 화면만 보여주고,
  // 이미 가입된 멤버든 아니든 joinGroup 결과와 상관없이 동일 UI 유지
  if (isMobile) {
    return <MobileHomePage groupName={groupName} />;
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">그룹에 가입하는 중...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">가입 완료 중...</p>
        </div>
      </div>
    );
  }

  return null;
}
