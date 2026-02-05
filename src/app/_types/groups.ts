export type MyGroup = {
  groupId: string;
  groupName: string;
  imageUrl?: string;
  members: Mate[];
};

export type Mate = {
  userId: string;
  nickname: string;
  profileUrl: string;
  level: number;
  groupNames: string[];
  role?: "HOST" | "MEMBER"; // 그룹 내 역할
  isActive?: boolean; // 활동 중 여부 (웹사이트 접속 중이거나 개인 타이머 실행 중)
  lastActivityAt?: string | null; // 마지막 활동 시간 (ISO 8601 형식)
};

export type SortInfo = {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
};

export type PageableInfo = {
  unpaged: boolean;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  offset: number;
  sort: SortInfo[];
};

export type PageResponse<T> = {
  totalElements: number;
  totalPages: number;
  pageable: PageableInfo;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  size: number;
  content: T[];
  number: number;
  sort: SortInfo[];
  empty: boolean;
};

export type MatesPage = PageResponse<Mate>;

export type CreateGroupBody = {
  name: string;
  imageUrl: string;
};

// 그룹 상세
export type GroupDetail = {
  groupId: string;
  name: string;
  imageUrl: string;
  accumulatedDuration?: number; // 그룹 타이머 누적 시간 (초 단위)
  members: GroupMembers;
  progressRate: number;
  groupGoal: GroupGoal;
};

// 그룹 공동 목표
export type GroupGoal = {
  groupId: string;
  goalHours: number;
  goalMinutes: number;
};

// 그룹 멤버
export type GroupMembers = {
  userId: string;
  nickname: string;
  profileUrl: string;
  level?: number;
}[];

// 그룹 멤버 상태 (실시간 업데이트용)
export type GroupMemberStatus = {
  groupId: string;
  userId: string;
  nickname: string;
  profileUrl?: string;
  level: number;
  role?: "HOST" | "MEMBER";
  participationStatus: "NOT_PARTICIPATING" | "RESTING" | "PARTICIPATING";
  enteredAt?: string;
  daysSinceLastParticipation?: number;
  personalTimerSeconds?: number;
  todoTitle?: string;
  cheerCount?: number;
};

// 알림
export type NotiReq = {
  isNotificationAgreed: boolean;
  notificationCycle: number;
  notificationMessage: string;
};

export type NotiRes = {
  groupId: string;
  groupName: string;
  isNotificationAgreed: boolean;
  notificationCycle: number;
  notificationMessage: string;
};

//  목표시간
export interface GroupGoalReq {
  hour: number;
  minute: number;
}

export interface GroupGoalRes {
  groupId: string;
  goalHours: number;
  goalMinutes: number;
}

//초대
export type InviteRequest = {
  inviteeId: string;
};

export type InviteResponse = {
  statusCode: number;
  message: string;
  data: Record<string, never>; // 빈 객체
};

// 콕 찌르기 관련 타입
export type CommonGroup = {
  groupId: string;
  groupName: string;
  imageUrl?: string;
  memberCount: number;
  maxMemberCount: number;
  myParticipationStatus: "NOT_PARTICIPATING" | "RESTING" | "PARTICIPATING";
  targetParticipationStatus: "NOT_PARTICIPATING" | "RESTING" | "PARTICIPATING";
};

export type PokeRequest = {
  targetUserId: string;
  groupId: string;
};

export type PokeNotification = {
  fromUserId: string;
  fromUserNickname: string;
  targetUserId: string;
  groupId: string;
  groupName: string;
  message: string;
};

export type CheerNotification = {
  fromUserId: string;
  fromUserNickname: string;
  targetUserId: string;
  groupId: string;
  groupName: string;
  message: string;
};

export type GroupMeta = {
  groupId: string;
  groupName: string;
};
