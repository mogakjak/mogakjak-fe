"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveOfficialLounge } from "@/app/api/lounge/api";
import { loungeKeys } from "@/app/api/lounge/keys";
import { groupKeys } from "@/app/api/groups/keys";

export const useLeaveOfficialLounge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveOfficialLounge(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loungeKeys.summary() });
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    },
  });
};
