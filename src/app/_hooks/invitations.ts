"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyInvitations,
  postAcceptInvitation,
  postDeclineInvitation,
} from "@/app/api/invitations/api";
import { invitationKeys } from "@/app/api/invitations/keys";
import type { PendingInvitation } from "@/app/_types/invitations";

export const useMyInvitations = () =>
  useQuery<PendingInvitation[]>({
    queryKey: invitationKeys.my(),
    queryFn: getMyInvitations,
    staleTime: 5 * 60 * 1000,
  });

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (invitationId) => postAcceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.my() });
      // 그룹 목록도 갱신
      queryClient.invalidateQueries({ queryKey: ["groups", "my"] });
    },
  });
};

export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (invitationId) => postDeclineInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.my() });
    },
  });
};
