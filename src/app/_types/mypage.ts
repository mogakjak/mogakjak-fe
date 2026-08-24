export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type ProfileUpdate = {
  nickname?: string;
  email?: string;
  imageUrl?: string;
};

export type CharacterUpdate = {
  characterId: string;
};

export type CharacterGuideItem = {
  id: string;
  level: number;
  name: string;
  imageUrl: string;
  unlockTime: string;
  currentAttendanceDays: number;
  currentFocusTimeInSeconds: number;
  requiredAttendanceDays: number;
  requiredFocusTimeInSeconds: number;
  unlocked: boolean;
  requirementsSatisfied: boolean;
  attendanceProgressRate: number;
  focusTimeProgressRate: number;
};

export type CharacterCard = {
  characterId: string;
  name: string;
  imageUrl: string;
  level: number;
  unlockCondition: string;
  requiredAttendanceDays: number;
  requiredFocusTimeInSeconds: number;
  attendanceProgressRate: number;
  focusTimeProgressRate: number;
};

export type CharacterGrowthProgress = {
  currentAttendanceDays: number;
  currentFocusTimeInSeconds: number;
  currentLevel: number;
  nextLevel: number | null;
  requiredAttendanceDays: number | null;
  requiredFocusTimeInSeconds: number | null;
  remainingAttendanceDays: number | null;
  remainingFocusTimeInSeconds: number | null;
  attendanceProgressRate: number;
  focusTimeProgressRate: number;
  maxLevelReached: boolean;
};

export type CharacterBasket = {
  nickname: string;
  email: string;
  imageUrl: string;
  totalTaskCount: number;
  totalFocusTime: string;
  mainCharacter: CharacterCard;
  collectedCharacterCount: number;
  ownedCharacters: CharacterCard[];
  lockedCharacters: CharacterCard[];
  growthProgress: CharacterGrowthProgress;
};

// 프로필 관련 타입
export type Profile = {
  nickname: string;
  imageUrl: string;
  character: Character;
  quote: Quote;
};
export type Character = {
  id: string;
  level: number;
  name: string;
  mainCharacterImage: string;
  isActive: boolean;
  unlockTimeInSeconds: number;
  requiredAttendanceDays?: number;
};

export type Quote = {
  id: string;
  content: string;
  author: string;
};

// 총 누적 학습 시간 조회 타입
export interface TotalStudyTimeResponse {
  totalStudyTime: number;
}
