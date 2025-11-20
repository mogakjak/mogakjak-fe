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

export const getMates = (params?: GetMatesParams) => {
  const searchParams = new URLSearchParams();

  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.size !== undefined) searchParams.set("size", String(params.size));
  if (params?.groupId) searchParams.set("groupId", params.groupId);
  if (params?.search) searchParams.set("search", params.search);

  const query = searchParams.toString();
  const endpoint = query ? `/mates?${query}` : "/mates";

  return request<MatesPage>(endpoint, { method: "GET" });
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
