"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyInvitations,
  postAcceptInvitation,
  postDeclineInvitation,
  postInvitationUrl,
} from "@/app/api/invitations/api";
import { invitationKeys } from "@/app/api/invitations/keys";
import type {
  PendingInvitation,
  InvitationUrl,
} from "@/app/_types/invitations";

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

export const useInvitationUrl = () =>
  useMutation<InvitationUrl, Error, string>({
    mutationFn: (groupId) => postInvitationUrl(groupId),
  });
