/**
 * 마지막 활동 시간을 "n분 전" / "n일 전" 형식으로 변환
 * @param lastActivityAt ISO 8601 형식의 날짜 문자열 또는 null
 * @param isActive 현재 활동 중 여부
 * @returns 포맷팅된 문자열
 */
export function formatLastActivity(
  lastActivityAt: string | null | undefined,
  isActive: boolean
): string {
  // 현재 활동 중이면 "현재 활동 중" 반환
  if (isActive) {
    return "현재 활동 중";
  }

  // lastActivityAt이 없으면 "알 수 없음" 반환
  if (!lastActivityAt) {
    return "활동 없음";
  }

  try {
    const now = new Date();
    const lastActivity = new Date(lastActivityAt);
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // 1분 미만
    if (diffMinutes < 1) {
      return "방금 전";
    }

    // 1시간 미만
    if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    }

    // 24시간 미만
    if (diffHours < 24) {
      return `${diffHours}시간 전`;
    }

    // 1일 이상
    return `${diffDays}일 전`;
  } catch (error) {
    console.error("날짜 파싱 오류:", error);
    return "활동 없음";
  }
}
