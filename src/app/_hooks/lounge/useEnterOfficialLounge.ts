"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enterOfficialLounge } from "@/app/api/lounge/api";
import { loungeKeys } from "@/app/api/lounge/keys";
import { groupKeys } from "@/app/api/groups/keys";

export const useEnterOfficialLounge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => enterOfficialLounge(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loungeKeys.summary() });
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    },
  });
};
