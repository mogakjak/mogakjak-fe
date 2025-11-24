"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDeclineInvitation } from "@/app/api/invitations/api";
import { invitationKeys } from "@/app/api/invitations/keys";

export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (invitationId) => postDeclineInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.my() });
    },
  });
};

