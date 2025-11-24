"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroup } from "../../api/groups/api";
import { groupKeys } from "../../api/groups/keys";
import type { CreateGroupBody } from "../../_types/groups";

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateGroupBody) => createGroup(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    },
  });
};

