export interface CharacterAwardItem {
  id: string;
  level: number;
  name: string;
  mainCharacterImage: string;
  isActive: boolean;
  unlockTimeInSeconds: number;
}

export interface CheckAwardReq {
  totalStudyTimeInSeconds: number;
}

export type CheckAwardRes = CharacterAwardItem[];

export interface AwardCharacterState {
  level: number;
  name: string;
  imageSrc: string;
  hours: number;
}