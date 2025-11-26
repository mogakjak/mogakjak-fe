import type {
  MyGroup,
  MatesPage,
  Mate,
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
import { request } from "../request";

const GROUPS_BASE = "/api/groups";

export const getMyGroups = async () => {
  const result = await request<MyGroup[]>(GROUPS_BASE, "/my", {
    method: "GET",
  });
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

  const result = await request<MatesPage>(GROUPS_BASE, endpoint, {
    method: "GET",
  });

  // 백엔드에서 이미 groupNames 배열로 반환하므로, 중복 제거만 수행
  if (result?.content) {
    // 같은 userId를 가진 항목들을 그룹화하여 groupNames 배열 병합
    type RawMate = Mate & {
      groupNames?: string[];
      groupName?: string;
      isActive?: boolean;
      lastActivityAt?: string | null;
    };

    const userGroupMap = new Map<string, string[]>();
    const userMateMap = new Map<string, RawMate>();

    result.content.forEach((mate: RawMate) => {
      const userId = mate.userId;

      // 백엔드에서 groupNames 배열로 반환 (또는 레거시 groupName 단수)
      const groupNames =
        mate.groupNames || (mate.groupName ? [mate.groupName] : []);

      if (!userGroupMap.has(userId)) {
        userGroupMap.set(userId, []);
        userMateMap.set(userId, mate);
      }

      // groupNames 병합 (중복 제거)
      const existingGroups = userGroupMap.get(userId)!;
      groupNames.forEach((groupName) => {
        if (!existingGroups.includes(groupName)) {
          existingGroups.push(groupName);
        }
      });

      // isActive는 true가 있으면 우선
      const existing = userMateMap.get(userId)!;
      if (mate.isActive && !existing.isActive) {
        existing.isActive = true;
      }
      // lastActivityAt은 가장 최근 값으로 업데이트
      if (mate.lastActivityAt) {
        const existingLastActivityAt = existing.lastActivityAt;
        if (!existingLastActivityAt || new Date(mate.lastActivityAt) > new Date(existingLastActivityAt)) {
          existing.lastActivityAt = mate.lastActivityAt;
        }
      }
    });

    // 최종 메이트 목록 생성
    const finalMates: Mate[] = Array.from(userMateMap.entries()).map(
      ([userId, mate]) => ({
        ...mate,
        groupNames: userGroupMap.get(userId) || [],
        isActive: mate.isActive ?? false,
        lastActivityAt: mate.lastActivityAt ?? null,
      })
    );

    return {
      ...result,
      content: finalMates,
    };
  }

  return result;
};

export const createGroup = (body: CreateGroupBody) =>
  request<GroupDetail>(GROUPS_BASE, "", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateGroup = (groupId: string, body: CreateGroupBody) =>
  request<GroupDetail>(GROUPS_BASE, `/${groupId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const getGroupDetail = (groupId: string) =>
  request<GroupDetail>(GROUPS_BASE, `/${groupId}`, {
    method: "GET",
  });

export const getGroupInviteLink = (groupId: string) =>
  request<{ inviteId: string }>(GROUPS_BASE, `/${groupId}/invitations/link`, {
    method: "GET",
  });

// 그룹 알림 설정
export const putGroupNoti = (groupId: string, payload: NotiReq) =>
  request<NotiRes>(GROUPS_BASE, `/${groupId}/notifications`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const putGroupGoal = (groupId: string, payload: GroupGoalReq) =>
  request<GroupGoalRes>(GROUPS_BASE, `/${groupId}/goals`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const leaveGroup = (groupId: string) =>
  request<unknown>(GROUPS_BASE, `/${groupId}/members/me`, {
    method: "DELETE",
  });

//초대
export const postGroupInvitation = (groupId: string, body: InviteRequest) =>
  request<InviteResponse>(GROUPS_BASE, `/${groupId}/invitations`, {
    method: "POST",
    body: JSON.stringify(body),
  });

// 자동 가입
export const joinGroup = (groupId: string) =>
  request<void>(GROUPS_BASE, `/${groupId}/join`, {
    method: "POST",
  });

// 그룹 세션에서 나가기
export const exitGroupSession = (groupId: string) =>
  request<void>(GROUPS_BASE, `/${groupId}/session/me`, {
    method: "DELETE",
  });

// 콕 찌르기
export const getCommonGroups = (targetUserId: string) =>
  request<CommonGroup[]>(GROUPS_BASE, `/common-groups/${targetUserId}`, {
    method: "GET",
  });

export const sendPokeNotification = (body: PokeRequest) =>
  request<unknown>(GROUPS_BASE, "/poke", {
    method: "POST",
    body: JSON.stringify(body),
  });

// 응원 보내기
export type CheerRequest = {
  targetUserId: string;
};

export const sendCheer = (groupId: string, body: CheerRequest) =>
  request<unknown>(GROUPS_BASE, `/${groupId}/cheer`, {
    method: "POST",
    body: JSON.stringify(body),
  });
