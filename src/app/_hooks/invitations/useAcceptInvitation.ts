"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAcceptInvitation } from "@/app/api/invitations/api";
import { invitationKeys } from "@/app/api/invitations/keys";
import { groupKeys } from "@/app/api/groups/keys";

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (invitationId) => postAcceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.my() });
      // 초대 수락 후 갱신
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    },
  });
};