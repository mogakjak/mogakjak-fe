"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAcceptInvitation } from "@/app/api/invitations/api";
import { invitationKeys } from "@/app/api/invitations/keys";

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

