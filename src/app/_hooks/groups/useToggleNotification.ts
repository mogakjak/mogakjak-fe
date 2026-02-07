import { useState, useEffect } from "react";
import { useGetGroupNotifications } from "./useGetGroupNotifications";
import { useUpdateGroupNotifications } from "./useUpdateGroupNotifications";

/**
 * 그룹 알림 토글 상태를 관리하는 커스텀 훅
 * @param groupId 그룹 ID
 * @param options 추가 옵션 (refetchInterval 등)
 * @returns 알림 데이터, 로컬 토글 상태, 토글 핸들러
 */
export function useToggleNotification(
    groupId: string,
    options?: { refetchInterval?: number }
) {
    const [localAgreed, setLocalAgreed] = useState(false);

    const { data: notiData } = useGetGroupNotifications(groupId, options);
    const { mutateAsync: updateNoti } = useUpdateGroupNotifications(groupId);

    // 서버 데이터로 로컬 상태 동기화
    useEffect(() => {
        if (notiData) {
            setLocalAgreed(notiData.isNotificationAgreed);
        }
    }, [notiData]);

    const handleToggle = (checked: boolean) => {
        if (!notiData) return;

        // 낙관적 업데이트: 즉시 UI 반영
        setLocalAgreed(checked);

        // 백그라운드에서 서버 업데이트 (await 제거)
        updateNoti({
            isNotificationAgreed: checked,
            notificationCycle: notiData.notificationCycle,
            notificationMessage: notiData.notificationMessage,
        }).catch((e) => {
            console.error("알림 설정 업데이트 실패:", e);
            // 실패 시 롤백
            setLocalAgreed(!checked);
        });
    };

    return {
        notiData,
        localAgreed,
        handleToggle,
    };
}
