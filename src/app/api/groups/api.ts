import type {
  MyGroup,
  MatesPage,
  GroupDetail,
  CreateGroupBody,
  NotiRes,
  NotiReq,
  GroupGoalRes,
  GroupGoalReq,
  InviteResponse,
  InviteRequest,
  CommonGroup,
  PokeRequest,
} from "@/app/_types/groups";

const GROUPS_BASE = "/api/groups";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${GROUPS_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err?.message || err?.error || message;
    } catch {}
    throw new Error(message);
  }

  const json = (await res.json().catch(() => undefined)) as
    | { statusCode?: number; message?: string; data?: unknown }
    | undefined;

  if (json && typeof json.statusCode === "number") {
    const code = json.statusCode;
    const isSuccess = code === 0 || (code >= 200 && code < 300);
    if (!isSuccess) {
      throw new Error(json?.message ?? `HTTP ${code}`);
    }
    return json?.data as T;
  }

  return json as T;
}

export const getMyGroups = async () => {
  const result = await request<MyGroup[]>("/my", { method: "GET" });
  return result ?? [];
};

export type GetMatesParams = {
  page?: number;
  size?: number;
  groupId?: string;
  search?: string;
};

export const getMates = async (params?: GetMatesParams) => {
  const searchParams = new URLSearchParams();

  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.size !== undefined) searchParams.set("size", String(params.size));
  if (params?.groupId) searchParams.set("groupId", params.groupId);
  if (params?.search) searchParams.set("search", params.search);

  const query = searchParams.toString();
  const endpoint = query ? `/mates?${query}` : "/mates";

  const result = await request<MatesPage>(endpoint, { method: "GET" });
  
  // groupName을 groupNames 배열로 변환
  if (result?.content) {
    const userGroupMap = new Map<string, string[]>();
    
    // 같은 userId를 가진 항목들을 그룹화하여 groupNames 배열 생성
    // API 응답에는 groupName (단수)이 있지만, Mate 타입에는 groupNames (복수 배열)가 있음
    type RawMate = Mate & { groupName?: string };
    result.content.forEach((mate: RawMate) => {
      const userId = mate.userId;
      const groupName = mate.groupName;
      
      if (!userGroupMap.has(userId)) {
        userGroupMap.set(userId, []);
      }
      if (groupName && !userGroupMap.get(userId)!.includes(groupName)) {
        userGroupMap.get(userId)!.push(groupName);
      }
    });
    
    // 중복 제거 및 groupNames 변환
    const uniqueMates = new Map<string, Mate>();
    result.content.forEach((mate: RawMate) => {
      const userId = mate.userId;
      if (!uniqueMates.has(userId)) {
        uniqueMates.set(userId, {
          ...mate,
          groupNames: userGroupMap.get(userId) || [],
        });
      }
    });
    
    return {
      ...result,
      content: Array.from(uniqueMates.values()),
    };
  }
  
  return result;
};

export const createGroup = (body: CreateGroupBody) =>
  request<GroupDetail>("", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateGroup = (groupId: string, body: CreateGroupBody) =>
  request<GroupDetail>(`/${groupId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const getGroupDetail = (groupId: string) =>
  request<GroupDetail>(`/${groupId}`, {
    method: "GET",
  });

export const getGroupInviteLink = (groupId: string) =>
  request<{ inviteId: string }>(`/${groupId}/invitations/link`, {
    method: "GET",
  });

// 그룹 알림 설정
export const putGroupNoti = (groupId: string, payload: NotiReq) =>
  request<NotiRes>(`/${groupId}/notifications`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const putGroupGoal = (groupId: string, payload: GroupGoalReq) =>
  request<GroupGoalRes>(`/${groupId}/goals`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const leaveGroup = (groupId: string) =>
  request<unknown>(`/${groupId}/members/me`, {
    method: "DELETE",
  });

//초대
export const postGroupInvitation = (groupId: string, body: InviteRequest) =>
  request<InviteResponse>(`/${groupId}/invitations`, {
    method: "POST",
    body: JSON.stringify(body),
  });

// 자동 가입
export const joinGroup = (groupId: string) =>
  request<void>(`/${groupId}/join`, {
    method: "POST",
  });

// 그룹 세션에서 나가기
export const exitGroupSession = (groupId: string) =>
  request<void>(`/${groupId}/session/me`, {
    method: "DELETE",
  });

// 콕 찌르기
export const getCommonGroups = (targetUserId: string) =>
  request<CommonGroup[]>(`/common-groups/${targetUserId}`, {
    method: "GET",
  });

export const sendPokeNotification = (body: PokeRequest) =>
  request<unknown>("/poke", {
    method: "POST",
    body: JSON.stringify(body),
  });

// 응원 보내기
export type CheerRequest = {
  targetUserId: string;
};

export const sendCheer = (groupId: string, body: CheerRequest) =>
  request<unknown>(`/${groupId}/cheer`, {
    method: "POST",
    body: JSON.stringify(body),
  });

// 그룹 타이머 공개/비공개 설정
export type GroupTimerVisibilityRequest = {
  isTimerPublic: boolean;
};

export const updateGroupTimerVisibility = (
  groupId: string,
  payload: GroupTimerVisibilityRequest
) =>
  request<void>(`/${groupId}/timer/visibility`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
