"use client";

const PENDING_INVITE_KEY = "mg_invite_groupid";

export function setPendingInviteGroupId(groupId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_INVITE_KEY, groupId);
  localStorage.setItem(PENDING_INVITE_KEY, groupId);
}

export function getPendingInviteGroupId(): string | null {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem(PENDING_INVITE_KEY) ||
    localStorage.getItem(PENDING_INVITE_KEY)
  );
}

export function removePendingInviteGroupId(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_INVITE_KEY);
  localStorage.removeItem(PENDING_INVITE_KEY);
}
