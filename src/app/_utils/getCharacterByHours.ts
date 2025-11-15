import { CHARACTER_BY_HOURS } from "../_constants/character";
import { CharacterLevelInfo } from "../_types/characterLevel";

export const rows: CharacterLevelInfo[] = Object.values(
  CHARACTER_BY_HOURS
).sort((a, b) => a.hours - b.hours);

export function getCharacterByHours(totalHours: number): CharacterLevelInfo {
  let current = rows[0];
  for (const c of rows) {
    if (totalHours >= c.hours) current = c;
    else break;
  }
  return current;
}
