"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyInvitations } from "@/app/api/invitations/api";
import { invitationKeys } from "@/app/api/invitations/keys";
import type { PendingInvitation } from "@/app/_types/invitations";

export const useMyInvitations = () =>
  useQuery<PendingInvitation[]>({
    queryKey: invitationKeys.my(),
    queryFn: getMyInvitations,
    staleTime: 5 * 60 * 1000,
  });

