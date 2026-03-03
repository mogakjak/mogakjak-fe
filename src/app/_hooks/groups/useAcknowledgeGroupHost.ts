"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { putGroupHostAck } from "@/app/api/groups/api";
import { groupKeys } from "@/app/api/groups/keys";

export const useAcknowledgeGroupHost = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: putGroupHostAck,
    onSuccess: (_data, groupId) => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.hostAck(groupId),
      });
    },
  });
}

