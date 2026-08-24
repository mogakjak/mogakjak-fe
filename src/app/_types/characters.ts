export interface CharacterAwardItem {
  id: string;
  level: number;
  name: string;
  mainCharacterImage: string;
  isActive: boolean;
  unlockTimeInSeconds: number;
  requiredAttendanceDays?: number;
}

export type CheckAwardRes = CharacterAwardItem[];

export interface AwardCharacterState {
  level: number;
  name: string;
  imageSrc: string;
  requiredAttendanceDays?: number;
  requiredFocusTimeInSeconds?: number;
}
