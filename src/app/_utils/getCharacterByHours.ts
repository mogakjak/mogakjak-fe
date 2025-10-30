import { CHARACTER_BY_HOURS } from "../_constants/character";
import { CharacterLevelInfo } from "../_types/characterLevel";

export function getCharacterByHours(totalHours: number): CharacterLevelInfo {
  const thresholds = Object.keys(CHARACTER_BY_HOURS)
    .map(Number)
    .sort((a, b) => a - b);

  let current: CharacterLevelInfo = CHARACTER_BY_HOURS[thresholds[0]];
  for (const h of thresholds) {
    if (totalHours >= h) current = CHARACTER_BY_HOURS[h];
    else break;
  }

  return current;
}
