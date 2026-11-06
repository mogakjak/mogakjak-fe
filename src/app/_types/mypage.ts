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
  currentAttendanceDays?: number;
  currentFocusTimeInSeconds?: number;
  requiredAttendanceDays?: number;
  requiredFocusTimeInSeconds?: number;
  unlocked?: boolean;
  requirementsSatisfied?: boolean;
  attendanceProgressRate?: number;
  focusTimeProgressRate?: number;
};

export type CharacterCard = {
  characterId: string;
  name: string;
  imageUrl: string;
  level: number;
  unlockCondition: string;
  requiredAttendanceDays?: number;
  requiredFocusTimeInSeconds?: number;
  attendanceProgressRate?: number;
  focusTimeProgressRate?: number;
};

export type CharacterGrowthProgress = {
  currentAttendanceDays: number;
  currentFocusTimeInSeconds: number;
  currentLevel: number;
  nextLevel: number;
  requiredAttendanceDays: number;
  requiredFocusTimeInSeconds: number;
  remainingAttendanceDays: number;
  remainingFocusTimeInSeconds: number;
  attendanceProgressRate: number;
  focusTimeProgressRate: number;
  /** 현재 레벨에서 다음 레벨까지 두 조건 중 느린 쪽의 진행률(0~100) */
  levelProgressRate: number;
  /** Lv.1~12 전체 진행률(0~100) */
  overallProgressRate: number;
  maxLevelReached: boolean;
};

export type CharacterBasket = {
  nickname: string;
  email: string;
  imageUrl: string;
  totalTaskCount: number;
  totalFocusTime: string;
  growthProgress?: CharacterGrowthProgress;
  mainCharacter: CharacterCard;
  collectedCharacterCount: number;
  ownedCharacters: CharacterCard[];
  lockedCharacters: CharacterCard[];
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

// 출석 현황 조회 타입 (KST 기준 과거 5일·오늘·미래 4일)
export type AttendanceDay = {
  date: string;
  focusTimeInSeconds: number;
  attended: boolean;
  today: boolean;
  future: boolean;
};

export type MyPageAttendance = {
  referenceDate: string;
  timeZone: string;
  attendanceThresholdInSeconds: number;
  totalAttendanceDays: number;
  days: AttendanceDay[];
};
