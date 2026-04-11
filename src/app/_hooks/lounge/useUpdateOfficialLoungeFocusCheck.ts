"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOfficialLoungeFocusCheck } from "@/app/api/lounge/api";
import { loungeKeys } from "@/app/api/lounge/keys";
import { groupKeys } from "@/app/api/groups/keys";

export const useUpdateOfficialLoungeFocusCheck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => updateOfficialLoungeFocusCheck(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loungeKeys.summary() });
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    },
  });
};
