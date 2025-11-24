"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { putGroupNoti } from "../../api/groups/api";
import { groupKeys } from "../../api/groups/keys";
import type {
  NotiRes,
  NotiReq,
} from "../../_types/groups";

export const useUpdateGroupNotifications = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotiReq) => putGroupNoti(groupId, payload),
    onSuccess: (data: NotiRes) => {
      queryClient.setQueryData(groupKeys.notifications(groupId), data);
      queryClient.setQueryData<NotiRes | undefined>(
        groupKeys.detail(groupId),
        (prev) => (prev ? { ...prev, ...data } : data)
      );
    },
  });
};

