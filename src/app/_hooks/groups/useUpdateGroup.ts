"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGroup } from "../../api/groups/api";
import { groupKeys } from "../../api/groups/keys";
import type {
  GroupDetail,
  CreateGroupBody,
} from "../../_types/groups";

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GroupDetail,
    Error,
    { groupId: string; body: CreateGroupBody }
  >({
    mutationFn: ({ groupId, body }) => updateGroup(groupId, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.detail(data.groupId),
      });
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    },
  });
};

