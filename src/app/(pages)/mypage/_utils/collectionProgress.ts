import { rows } from "@/app/_utils/getCharacterByHours";
import type { CharacterGrowthProgress } from "@/app/_types/mypage";

const MAX_LEVEL = rows[rows.length - 1]?.level ?? 12;
const WINDOW_SIZE = 4;

export type CollectionProgress = {
  /** 누적 출석 일수 */
  attendanceDays: number;
  /** 누적 집중 시간(초) */
  focusSeconds: number;
  /** 모든 캐릭터 수집 완료 여부 */
  isComplete: boolean;
  /** 다음 레벨까지 남은 출석 일수 */
  remainingDays: number;
  /** 다음 레벨까지 남은 집중 시간(시간, 올림) */
  remainingHours: number;
  /** 진행 바에 표시할 레벨 4개 (현재 레벨부터) */
  windowLevels: number[];
  /** 진행 바 채움 비율 (0 ~ 1) */
  fillRate: number;
};

const clamp01 = (v: number) =>
  Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;

/** 서버의 growthProgress를 진행 바 표시용 값으로 변환 */
export function getCollectionProgress(
  growth: CharacterGrowthProgress | undefined,
  totalAttendanceDays?: number,
): CollectionProgress {
  const currentLevel = Math.min(
    MAX_LEVEL,
    Math.max(1, growth?.currentLevel ?? 1),
  );
  const isComplete = growth?.maxLevelReached ?? currentLevel >= MAX_LEVEL;

  const windowStart = Math.min(currentLevel, MAX_LEVEL - WINDOW_SIZE + 1);
  const windowLevels = Array.from(
    { length: WINDOW_SIZE },
    (_, i) => windowStart + i,
  );

  const levelRate = clamp01((growth?.levelProgressRate ?? 0) / 100);
  const fillRate = isComplete
    ? 1
    : clamp01((currentLevel - windowStart + levelRate) / (WINDOW_SIZE - 1));

  return {
    attendanceDays:
      totalAttendanceDays ?? growth?.currentAttendanceDays ?? 0,
    focusSeconds: growth?.currentFocusTimeInSeconds ?? 0,
    isComplete,
    remainingDays: isComplete ? 0 : (growth?.remainingAttendanceDays ?? 0),
    remainingHours: isComplete
      ? 0
      : Math.ceil((growth?.remainingFocusTimeInSeconds ?? 0) / 3600),
    windowLevels,
    fillRate,
  };
}
