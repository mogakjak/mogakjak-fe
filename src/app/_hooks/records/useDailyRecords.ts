"use client";

import { useQuery } from "@tanstack/react-query";
import { getDailyRecords } from "../../api/records/api";
import { recordKeys } from "../../api/records/keys";
import type { DailyFocus } from "../../_types/records";

export const useDailyRecords = () =>
  useQuery<DailyFocus[]>({
    queryKey: recordKeys.daily(),
    queryFn: getDailyRecords,
    staleTime: 5 * 60 * 1000,
  });

