"use client";

import { putMyGroupFocusCheck } from "@/app/api/groups/api";
import { groupKeys } from "@/app/api/groups/keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateMyGroupFocusCheck = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) =>
      putMyGroupFocusCheck(groupId, { enabled }),
    onSuccess: (data) => {
      queryClient.setQueryData(groupKeys.focusCheck(groupId), data);
    },
  });
};
