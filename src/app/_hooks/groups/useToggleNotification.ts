import { useState, useEffect } from "react";
import { useGetGroupNotifications } from "./useGetGroupNotifications";
import { useGetMyGroupFocusCheck } from "./useGetMyGroupFocusCheck";
import { useUpdateMyGroupFocusCheck } from "./useUpdateMyGroupFocusCheck";

/**
 * 그룹 알림 토글 상태를 관리하는 커스텀 훅
 * @param groupId 그룹 ID
 * @returns 알림 데이터, 로컬 토글 상태, 토글 핸들러
 */
export function useToggleNotification(groupId: string) {
    const [localEnabled, setLocalEnabled] = useState(true);

    const { data: notiData } = useGetGroupNotifications(groupId);
    const { data: focusCheckData } = useGetMyGroupFocusCheck(groupId);
    const { mutateAsync: updateFocusCheck } = useUpdateMyGroupFocusCheck(groupId);

    // 서버 데이터로 로컬 상태 동기화
    useEffect(() => {
        if (focusCheckData) {
            setLocalEnabled(focusCheckData.myFocusCheckEnabled);
        }
    }, [focusCheckData]);

    const handleToggle = (checked: boolean) => {
        if (!focusCheckData) return;

        // 낙관적 업데이트: 즉시 UI 반영
        setLocalEnabled(checked);

        // 백그라운드에서 서버 업데이트 (await 제거)
        updateFocusCheck(checked).catch((e) => {
            console.error("알림 설정 업데이트 실패:", e);
            // 실패 시 롤백
            setLocalEnabled(!checked);
        });
    };

    return {
        notiData,
        localEnabled,
        handleToggle,
        isReady: !!notiData && !!focusCheckData,
    };
}
