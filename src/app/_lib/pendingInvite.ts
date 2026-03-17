"use client";

const PENDING_INVITE_KEY = "mg_invite_groupid";

export function setPendingInviteGroupId(groupId: string): void {
  if (typeof window === "undefined") return;
  
  sessionStorage.setItem(PENDING_INVITE_KEY, groupId);
  localStorage.setItem(PENDING_INVITE_KEY, groupId);
  
  // 쿠키에 1시간 동안 저장 (OAuth 리다이렉트 시 유실 방지)
  document.cookie = `${PENDING_INVITE_KEY}=${groupId}; path=/; max-age=3600; SameSite=Lax`;
}

export function getPendingInviteGroupId(): string | null {
  if (typeof window === "undefined") return null;
  
  // 1. Storage 확인
  const stored = sessionStorage.getItem(PENDING_INVITE_KEY) || localStorage.getItem(PENDING_INVITE_KEY);
  if (stored) return stored;

  // 2. Storage가 비어있다면 쿠키 파싱
  const name = `${PENDING_INVITE_KEY}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }

  return null;
}

export function removePendingInviteGroupId(): void {
  if (typeof window === "undefined") return;
  
  sessionStorage.removeItem(PENDING_INVITE_KEY);
  localStorage.removeItem(PENDING_INVITE_KEY);
  document.cookie = `${PENDING_INVITE_KEY}=; path=/; max-age=0; SameSite=Lax`;
}
