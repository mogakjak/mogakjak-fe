export type MyGroup = {
  groupId: string;
  groupName: string;
  profileUrl?: string;
};

export type Mate = {
  userId: string;
  nickname: string;
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
  description: string;
};

// 그룹 상세
export type GroupDetail = {
  groupId: string;
  name: string;
  description: string;
  members: GroupMembers;
};

// 그룹 멤버
export type GroupMembers = {
  userId: string;
  nickname: string;
  profileUrl: string;
}[];

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
