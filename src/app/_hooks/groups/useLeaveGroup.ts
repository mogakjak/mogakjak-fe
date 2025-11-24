"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveGroup } from "../../api/groups/api";
import { groupKeys } from "../../api/groups/keys";

// 그룹 탈퇴
export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (groupId: string) => leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    },
  });
};

