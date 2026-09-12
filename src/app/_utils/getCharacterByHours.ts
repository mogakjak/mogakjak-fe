import { CHARACTER_LEVELS } from "../_constants/character";
import { CharacterLevelInfo } from "../_types/characterLevel";

export const rows: CharacterLevelInfo[] = [...CHARACTER_LEVELS].sort(
  (a, b) => a.level - b.level,
);

/** 출석 일수와 집중 시간을 모두 충족한 최고 레벨 */
export function getCharacterByProgress(
  totalHours: number,
  attendanceDays: number,
): CharacterLevelInfo {
  let current = rows[0];
  for (const c of rows) {
    if (totalHours >= c.hours && attendanceDays >= c.attendanceDays) {
      current = c;
    } else {
      break;
    }
  }
  return current;
}

/** @deprecated getCharacterByProgress 사용 */
export function getCharacterByHours(totalHours: number): CharacterLevelInfo {
  return getCharacterByProgress(totalHours, Number.POSITIVE_INFINITY);
}

export function getCharacterByLevel(level: number): CharacterLevelInfo | null {
  return rows.find((c) => c.level === level) ?? null;
}

export function formatUnlockCondition(item: CharacterLevelInfo): string {
  if (item.level === 1) return "회원가입";
  return `${item.attendanceDays}일 · ${item.hours}시간`;
}
