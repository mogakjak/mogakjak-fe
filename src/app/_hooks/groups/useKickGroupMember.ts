"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { kickGroupMember } from "../../api/groups/api";
import { groupKeys } from "../../api/groups/keys";

type KickGroupMemberVars = {
  groupId: string;
  targetUserId: string;
};

export const useKickGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, KickGroupMemberVars>({
    mutationFn: ({ groupId, targetUserId }) =>
      kickGroupMember(groupId, targetUserId),
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    },
  });
};
