"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useJoinGroup } from "@/app/_hooks/groups/useJoinGroup";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
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
  const { isLoggedIn, ready } = useAuthState();
  const [isMobile, setIsMobile] = useState(false);
  const hasJoinedRef = useRef(false);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string }>({
    isVisible: false,
    message: "",
  });

  const {
    mutateAsync: joinGroupAsync,
    isPending,
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

  }, [router]);

  useEffect(() => {
    if (!groupid || !ready) return;
    if (hasJoinedRef.current) return;

    if (!isLoggedIn) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("mg_invite_groupid", groupid);
      }
      router.replace("/login");
      return;
    }

    hasJoinedRef.current = true;

    const runJoin = async () => {
      try {
        await joinGroupAsync(groupid);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("mg_invite_groupid");
        }
        window.location.replace(`/group/${groupid}`);
      } catch (err) {
        hasJoinedRef.current = false;
        console.error("그룹 가입 실패:", err);

        const errorMessage = err instanceof Error ? err.message : String(err);
        const lowerMessage = errorMessage.toLowerCase();

        const isUnauthorized =
          lowerMessage.includes("unauthorized") ||
          lowerMessage.includes("401") ||
          errorMessage.includes("인증") ||
          errorMessage.includes("로그인");
        if (isUnauthorized) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("mg_invite_groupid", groupid);
          }
          router.replace("/login");
          return;
        }

        const errWithStatus = err as { status?: number } | null;
        const errStatus = errWithStatus?.status;
        const isAlreadyMember =
          errStatus === 409 ||
          errorMessage.includes("이미 참여") ||
          errorMessage.includes("409") ||
          lowerMessage.includes("conflict") ||
          lowerMessage.includes("already member") ||
          lowerMessage.includes("already participating") ||
          lowerMessage.includes("already in");
        if (isAlreadyMember) {
          window.location.replace(`/group/${groupid}`);
          return;
        }

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
        } else {
          setToast({ isVisible: true, message: errorMessage });
          setTimeout(() => setToast((p) => ({ ...p, isVisible: false })), 2000);
        }
      }
    };

    runJoin();
  }, [groupid, ready, isLoggedIn, joinGroupAsync, router]);

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

  if (!ready || isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">그룹에 가입하는 중...</p>
        </div>
      </div>
    );
  }

  return null;
}
