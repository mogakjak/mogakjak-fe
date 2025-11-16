export type MyGroup = {
  groupId: string;
  groupName: string;
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

export type GroupDetail = {
  groupId: string;
  name: string;
  description: string;
  members: {
    userId: string;
    nickname: string;
    profileUrl: string;
  }[];
};
