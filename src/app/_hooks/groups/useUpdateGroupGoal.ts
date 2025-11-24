"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { putGroupGoal } from "../../api/groups/api";
import { groupKeys } from "../../api/groups/keys";
import type {
  GroupGoalRes,
  GroupGoalReq,
  GroupDetail,
} from "../../_types/groups";

export const useUpdateGroupGoal = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GroupGoalReq) => putGroupGoal(groupId, payload),

    onSuccess: (data: GroupGoalRes) => {
      queryClient.setQueryData(groupKeys.goal(groupId), data);
      queryClient.setQueryData<GroupDetail | undefined>(
        groupKeys.detail(groupId),
        (prev) =>
          prev
            ? {
                ...prev,
                goalHours: data.goalHours,
                goalMinutes: data.goalMinutes,
              }
            : prev
      );
    },
  });
};

