"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useJoinGroup } from "@/app/_hooks/groups/useJoinGroup";
import { useGroupDetail } from "@/app/_hooks/groups/useGroupDetail";
import { groupKeys } from "@/app/api/groups/keys";
import MobileHomePage from "@/app/_components/home/mobileHomePage";

export default function InvitePageClient({ groupid }: { groupid: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMobile, setIsMobile] = useState(false);

  const {
    mutate: joinGroup,
    isPending,
    isSuccess,
    isError,
    error,
  } = useJoinGroup();

  const { data: groupData, isLoading: isLoadingGroup } = useGroupDetail(
    groupid || "",
    {
      enabled: !!groupid && isSuccess && isMobile,
    }
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      const isMobileDevice =
        /iPhone|iPad|iPod|Android|Mobile|Windows Phone/i.test(ua);
      setIsMobile(isMobileDevice);
    }
  }, []);

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

  useEffect(() => {
    if (isSuccess && !isMobile) {
      router.push("/");
    }
  }, [isSuccess, isMobile, router]);

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
    if (!isMobile) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">가입 완료 중...</p>
          </div>
        </div>
      );
    }

    if (isLoadingGroup || !groupData) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">그룹 정보를 불러오는 중...</p>
          </div>
        </div>
      );
    }

    const inviter = groupData.members?.[0];

    return (
      <MobileHomePage
        inviterNickname={inviter?.nickname}
        groupName={groupData.name}
      />
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 text-4xl">✗</div>
          <h1 className="text-2xl font-bold mb-2">가입 실패</h1>
          <p className="text-gray-600 mb-4">
            {error?.message || "그룹 가입에 실패했습니다."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
}
