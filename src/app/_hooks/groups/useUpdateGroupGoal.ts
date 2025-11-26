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
      // 목표 데이터만 캐시 업데이트 (별도 키)
      queryClient.setQueryData(groupKeys.goal(groupId), data);

      queryClient.setQueryData<GroupDetail | undefined>(
        groupKeys.detail(groupId),
        (prev) =>
          prev
            ? {
                ...prev,
                groupGoal: {
                  ...prev.groupGoal,
                  goalHours: data.goalHours,
                  goalMinutes: data.goalMinutes,
                },
              }
            : prev
      );
    },
  });
};
