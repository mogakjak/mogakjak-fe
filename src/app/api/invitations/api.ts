import type {
  PendingInvitation,
  InvitationUrl,
} from "@/app/_types/invitations";

const INVITATION_BASE = "/api/invitations";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${INVITATION_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      msg = err?.message || err?.error || msg;
    } catch {
      console.error("Failed to parse error response body");
    }
    throw new Error(msg);
  }

  const json = await res.json().catch(() => undefined);

  if (json && typeof json === "object" && typeof json.statusCode === "number") {
    const code = json.statusCode;
    const isSuccess = code === 0 || (code >= 200 && code < 300);

    if (!isSuccess) {
      throw new Error(json?.message ?? `HTTP ${code}`);
    }

    return json.data as T;
  }

  return json as T;
}

export const getMyInvitations = () =>
  request<PendingInvitation[]>("/my", {
    method: "GET",
  });

export const postAcceptInvitation = (invitationId: string) =>
  request<unknown>(`/${invitationId}/accept`, {
    method: "POST",
  });

export const postDeclineInvitation = (invitationId: string) =>
  request<unknown>(`/${invitationId}/decline`, {
    method: "POST",
  });

export const postInvitationUrl = (groupId: string) =>
  request<InvitationUrl>(`/invitation/${groupId}/url`, {
    method: "POST",
  });
