export interface CharacterLevelInfo {
  level: number;
  name: string;
  /** 필요 누적 집중 시간 (시간) */
  hours: number;
  /** 필요 누적 출석 일수 */
  attendanceDays: number;
  description: string;
}
