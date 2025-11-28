import { useCallback, useEffect, useRef } from "react";
import { useExitGroupSession } from "@/app/_hooks/groups/useExitGroupSession";
import { useAuthState } from "@/app/_hooks/login/useAuthState";

export function useGroupSessionExitGuard(groupId: string) {
    const { mutateAsync: exitSessionMutation } = useExitGroupSession();
    const { token } = useAuthState();
    const hasExitedRef = useRef(false);

    // 🔹 일반 상황(버튼, 리뷰 완료 등)에서 쓰는 비동기 나가기
    const exitSessionOnce = useCallback(async () => {
        if (hasExitedRef.current) return;

        try {
            await exitSessionMutation(groupId);
        } catch (e) {
            console.error("[useGroupSessionExitGuard] exitSession error", e);
        } finally {
            hasExitedRef.current = true;
        }
    }, [exitSessionMutation, groupId]);

    // 🔹 탭 닫기/새로고침/페이지 이동 시 사용하는 동기적 나가기 (fetch keepalive)
    const exitSessionSync = useCallback(() => {
        if (hasExitedRef.current) return;

        try {
            fetch(`/api/groups/${groupId}/session/me`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                keepalive: true, // 브라우저가 닫혀도 요청이 완료됨
            }).catch((e) => {
                console.error("[useGroupSessionExitGuard] fetch keepalive error", e);
            });
        } catch (e) {
            console.error("[useGroupSessionExitGuard] exitSessionSync error", e);
        } finally {
            hasExitedRef.current = true;
        }
    }, [groupId, token]);

    // 탭 닫기 / 새로고침 감지
    useEffect(() => {
        const handlePageHide = () => {
            // 문서 자체를 떠날 때 (탭 닫기, 새로고침, 다른 사이트로 이동 등)
            exitSessionSync();
        };

        window.addEventListener("pagehide", handlePageHide);

        return () => {
            window.removeEventListener("pagehide", handlePageHide);
        };
    }, [exitSessionSync]);

    return {
        exitSessionOnce,
        hasExitedRef,
    };
}
