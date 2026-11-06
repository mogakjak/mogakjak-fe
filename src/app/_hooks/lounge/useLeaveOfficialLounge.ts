"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveOfficialLounge } from "@/app/api/lounge/api";
import { loungeKeys } from "@/app/api/lounge/keys";
import { groupKeys } from "@/app/api/groups/keys";
import type { MyGroup } from "@/app/_types/groups";

export const useLeaveOfficialLounge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveOfficialLounge(),
    onSuccess: (summary) => {
      // 퇴실 응답의 인원 수를 바로 반영해 새로고침 없이 갱신
      queryClient.setQueryData(loungeKeys.summary(), summary);
      queryClient.setQueryData<MyGroup[] | undefined>(groupKeys.my(), (prev) =>
        prev?.map((group) =>
          group.isOfficialLounge && group.groupId === summary.groupId
            ? {
                ...group,
                currentMemberCount: summary.currentMemberCount,
                maxMemberCount: summary.maxMemberCount,
                hasEntered: summary.hasEntered,
                members: summary.members,
              }
            : group,
        ),
      );
      queryClient.invalidateQueries({ queryKey: loungeKeys.summary() });
      queryClient.invalidateQueries({ queryKey: groupKeys.my() });
    },
  });
};
