"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendOfficialLoungeCheer } from "@/app/api/lounge/api";
import { loungeKeys } from "@/app/api/lounge/keys";
import { groupKeys } from "@/app/api/groups/keys";

export const useSendOfficialLoungeCheer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string) => sendOfficialLoungeCheer(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loungeKeys.summary() });
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    },
  });
};
