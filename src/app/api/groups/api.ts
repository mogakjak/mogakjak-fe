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
  
  // 백엔드에서 이미 groupNames 배열로 반환하므로, 중복 제거만 수행
  if (result?.content) {
    // 같은 userId를 가진 항목들을 그룹화하여 groupNames 배열 병합
    type RawMate = Mate & { groupNames?: string[]; groupName?: string; isActive?: boolean };
    
    // 디버깅: API 응답 확인
    console.log("[getMates] API 응답:", result.content.map((m: RawMate) => ({ 
      userId: m.userId, 
      nickname: m.nickname, 
      isActive: m.isActive,
      groupNames: m.groupNames 
    })));
    const userGroupMap = new Map<string, string[]>();
    const userMateMap = new Map<string, RawMate>();
    
    result.content.forEach((mate: RawMate) => {
      const userId = mate.userId;
      
      // 백엔드에서 groupNames 배열로 반환 (또는 레거시 groupName 단수)
      const groupNames = mate.groupNames || (mate.groupName ? [mate.groupName] : []);
      
      if (!userGroupMap.has(userId)) {
        userGroupMap.set(userId, []);
        userMateMap.set(userId, mate);
      }
      
      // groupNames 병합 (중복 제거)
      const existingGroups = userGroupMap.get(userId)!;
      groupNames.forEach(groupName => {
        if (!existingGroups.includes(groupName)) {
          existingGroups.push(groupName);
        }
      });
      
      // isActive는 true가 있으면 우선
      const existing = userMateMap.get(userId)!;
      if (mate.isActive && !existing.isActive) {
        existing.isActive = true;
      }
    });
    
    // 최종 메이트 목록 생성
    const finalMates: Mate[] = Array.from(userMateMap.entries()).map(([userId, mate]) => ({
      ...mate,
      groupNames: userGroupMap.get(userId) || [],
      isActive: mate.isActive ?? false,
    }));
    
    // 디버깅: 최종 변환된 메이트 목록 확인
    console.log("[getMates] 최종 변환된 메이트:", finalMates.map(m => ({ 
      userId: m.userId, 
      nickname: m.nickname, 
      isActive: m.isActive,
      groupNames: m.groupNames 
    })));
    
    return {
      ...result,
      content: finalMates,
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
