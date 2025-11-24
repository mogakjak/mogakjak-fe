"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postGroupInvitation } from "../../api/groups/api";
import { groupKeys } from "../../api/groups/keys";
import type { InviteRequest } from "../../_types/groups";

// 초대
export const useInviteMate = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: InviteRequest) => postGroupInvitation(groupId, body),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({
        queryKey: groupKeys.invitations(groupId),
      });
    },
  });
};

