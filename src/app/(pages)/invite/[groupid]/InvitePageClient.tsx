"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useJoinGroup } from "@/app/_hooks/groups/useJoinGroup";
import { groupKeys } from "@/app/api/groups/keys";
import MobileHomePage from "@/app/_components/home/mobileHomePage";
import SimpleToast from "@/app/_components/common/SimpleToast";

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
  const [toast, setToast] = useState<{ isVisible: boolean; message: string }>({
    isVisible: false,
    message: "",
  });

  const {
    mutate: joinGroup,
    isPending,
    isSuccess,
    isError,
    error,
  } = useJoinGroup();

  const isExpired = useMemo(() => {
    if (typeof window === "undefined") return false;
    
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const lowerMessage = errorMessage.toLowerCase();
      
      if (
        errorMessage.includes("그룹을 찾을 수 없습니다") ||
        errorMessage.includes("그룹을 찾을 수 없음") ||
        errorMessage.includes("Group not found") ||
        errorMessage.includes("group not found") ||
        lowerMessage.includes("not found") ||
        lowerMessage.includes("404")
      ) {
        return true;
      }
    }
    
    return false;
  }, [error]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent;
    const isMobileDevice =
      /iPhone|iPad|iPod|Android|Mobile|Windows Phone/i.test(ua);
    setIsMobile(isMobileDevice);

    // 모바일이 아니면 초대 페이지가 아니라 바로 홈으로 이동
    if (!isMobileDevice) {
      router.push("/");
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
        
        const errorMessage = err instanceof Error ? err.message : String(err);
        const lowerMessage = errorMessage.toLowerCase();
        
        if (
          errorMessage.includes("그룹을 찾을 수 없습니다") ||
          errorMessage.includes("그룹을 찾을 수 없음") ||
          errorMessage.includes("Group not found") ||
          errorMessage.includes("group not found") ||
          lowerMessage.includes("not found") ||
          lowerMessage.includes("404")
        ) {
          setToast({ isVisible: true, message: "만료된 그룹 링크입니다" });
          setTimeout(() => {
            setToast((prev) => ({ ...prev, isVisible: false }));
          }, 2000);
        }
      },
    });
  }, [groupid, joinGroup, queryClient]);

  if (isMobile) {
    return (
      <>
        <SimpleToast
          isVisible={toast.isVisible}
          message={toast.message}
          position="top"
        />
        <MobileHomePage groupName={groupName} isExpired={isExpired} />
      </>
    );
  }

  // 실패 처리 UI
  if (isError) {
    const message =
      error instanceof Error
        ? error.message
        : "그룹 가입 중 오류가 발생했어요.";

    return (
      <>
        <SimpleToast
          isVisible={toast.isVisible}
          message={toast.message}
          position="top"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-3">
            <p className="text-gray-800 font-semibold">
              그룹에 가입하지 못했어요.
            </p>
            <p className="text-gray-500 text-sm">{message}</p>
            <button
              type="button"
              className="mt-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm"
              onClick={() => router.push("/")}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">그룹에 가입하는 중...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">가입 완료 중...</p>
        </div>
      </div>
    );
  }

  return null;
}
