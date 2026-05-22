"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateTimerTabOrder,
  type TimerTabType,
  type UpdateTimerTabOrderPayload,
} from "@/app/api/timerSettings/api";
import { timerSettingsKeys } from "@/app/api/timerSettings/keys";

export const useUpdateTimerTabOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTimerTabOrderPayload) =>
      updateTimerTabOrder(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: timerSettingsKeys.tabOrder(),
      });
      const previous = queryClient.getQueryData<{ tabOrder: TimerTabType[] }>(
        timerSettingsKeys.tabOrder(),
      );
      queryClient.setQueryData(timerSettingsKeys.tabOrder(), {
        tabOrder: payload.tabOrder,
      });
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          timerSettingsKeys.tabOrder(),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: timerSettingsKeys.tabOrder(),
      });
    },
  });
};
