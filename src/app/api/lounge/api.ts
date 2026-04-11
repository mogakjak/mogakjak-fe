import { request } from "../request";
import type { MyGroup, QuoteCard } from "@/app/_types/groups";

const LOUNGE_BASE = "/api/lounge";

type OfficialLoungeMember = MyGroup["members"][number];

type OfficialLoungeSummaryResponse = {
  loungeId: string;
  loungeName: string;
  imageUrl?: string | null;
  currentMemberCount: number;
  maxMemberCount: number;
  hasEntered: boolean;
  myFocusCheckEnabled: boolean;
  todayQuote?: QuoteCard | null;
  members: Array<{
    userId: string;
    nickname: string;
    profileUrl?: string | null;
    level?: number | null;
    participationStatus?: "NOT_PARTICIPATING" | "RESTING" | "PARTICIPATING" | null;
    personalTimerSeconds?: number | null;
    todoTitle?: string | null;
    lastActiveAt?: string | null;
  }>;
};

export type OfficialLoungeFocusCheckRequest = {
  enabled: boolean;
};

const normalizeMembers = (
  members: OfficialLoungeSummaryResponse["members"],
): OfficialLoungeMember[] =>
  members.map((member) => ({
    userId: member.userId,
    nickname: member.nickname,
    profileUrl: member.profileUrl ?? "",
    level: member.level ?? 1,
    isActive: true,
    participationStatus: member.participationStatus ?? "NOT_PARTICIPATING",
    personalTimerSeconds: member.personalTimerSeconds ?? null,
    todoTitle: member.todoTitle ?? null,
    lastActiveAt: member.lastActiveAt ?? null,
  }));

const normalizeSummary = (
  summary: OfficialLoungeSummaryResponse,
): MyGroup => ({
  groupId: summary.loungeId,
  groupName: summary.loungeName,
  imageUrl: summary.imageUrl ?? undefined,
  isOfficialLounge: true,
  currentMemberCount: summary.currentMemberCount,
  maxMemberCount: summary.maxMemberCount,
  hasEntered: summary.hasEntered,
  myFocusCheckEnabled: summary.myFocusCheckEnabled,
  todayQuote: summary.todayQuote ?? null,
  members: normalizeMembers(summary.members),
});

export const getOfficialLoungeSummary = async () => {
  const result = await request<OfficialLoungeSummaryResponse>(LOUNGE_BASE, "", {
    method: "GET",
  });

  return normalizeSummary(result);
};

export const enterOfficialLounge = async () => {
  const result = await request<OfficialLoungeSummaryResponse>(LOUNGE_BASE, "/enter", {
    method: "POST",
  });

  return normalizeSummary(result);
};

export const leaveOfficialLounge = async () => {
  const result = await request<OfficialLoungeSummaryResponse>(LOUNGE_BASE, "/leave", {
    method: "DELETE",
    keepalive: true,
  });

  return normalizeSummary(result);
};

export const updateOfficialLoungeFocusCheck = async (enabled: boolean) => {
  const result = await request<OfficialLoungeSummaryResponse>(LOUNGE_BASE, "/focus-check", {
    method: "PUT",
    body: JSON.stringify({ enabled } satisfies OfficialLoungeFocusCheckRequest),
  });

  return normalizeSummary(result);
};
