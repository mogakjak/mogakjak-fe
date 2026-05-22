"use client";

import { useQuery } from "@tanstack/react-query";
import { getTimerTabOrder } from "@/app/api/timerSettings/api";
import { timerSettingsKeys } from "@/app/api/timerSettings/keys";

export const useTimerTabOrder = () =>
  useQuery({
    queryKey: timerSettingsKeys.tabOrder(),
    queryFn: getTimerTabOrder,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
