import type { PendingInvitation } from "@/app/_types/invitations";
import { request } from "../request";

const INVITATION_BASE = "/api/invitations";

export const getMyInvitations = () =>
  request<PendingInvitation[]>(INVITATION_BASE, "/my", {
    method: "GET",
  });

export const postAcceptInvitation = (invitationId: string) =>
  request<unknown>(INVITATION_BASE, `/${invitationId}/accept`, {
    method: "POST",
  });

export const postDeclineInvitation = (invitationId: string) =>
  request<unknown>(INVITATION_BASE, `/${invitationId}/decline`, {
    method: "POST",
  });
