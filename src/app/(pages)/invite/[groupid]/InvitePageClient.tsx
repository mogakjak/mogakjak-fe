"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useJoinGroup } from "@/app/_hooks/groups/useJoinGroup";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
import MobileHomePage from "@/app/_components/home/mobileHomePage";
import SimpleToast from "@/app/_components/common/SimpleToast";
import {
  removePendingInviteGroupId,
  setPendingInviteGroupId,
} from "@/app/_lib/pendingInvite";
import { 
  decideInviteJoinAction,
  isJoinGroupNotFound
} from "@/app/_lib/invite/inviteRedirectLogic";

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
    
    if (error && isJoinGroupNotFound(error)) {
      return true;
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

    const runJoin = async () => {
      // 1. 초기 상태에서 가이드 필요 여부 확인 (error 없이 호출)
      const initialDecision = decideInviteJoinAction({ groupId: groupid, isLoggedIn });
      if (initialDecision.type === "REDIRECT") {
        if (initialDecision.savePending) setPendingInviteGroupId(groupid);
        router.replace(initialDecision.path);
        return;
      }

      hasJoinedRef.current = true;

      try {
        await joinGroupAsync(groupid);
        const successDecision = decideInviteJoinAction({ groupId: groupid, isLoggedIn });
        if (successDecision.type === "SUCCESS") {
          removePendingInviteGroupId();
          window.location.replace(successDecision.path);
        }
      } catch (err) {
        hasJoinedRef.current = false;
        console.error("그룹 가입 실패:", err);

        const decision = decideInviteJoinAction({ groupId: groupid, isLoggedIn, error: err });
        
        if (decision.type === "REDIRECT") {
          if (decision.savePending) setPendingInviteGroupId(groupid);
          router.replace(decision.path);
        } else if (decision.type === "SUCCESS") {
          window.location.replace(decision.path);
        } else if (decision.type === "TOAST") {
          setToast({ isVisible: true, message: decision.message });
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
