"use client";

import { useQuery } from "@tanstack/react-query";
import { getDailyRecords, getRecordDashboard } from "../api/records/api";
import { recordKeys } from "../api/records/keys";
import type { DailyFocus, RecordDashboard } from "../_types/records";

export const useRecordDashboard = (rangeType: string = "TODAY") =>
  useQuery<RecordDashboard>({
    queryKey: recordKeys.dashboard(rangeType),
    queryFn: () => getRecordDashboard(rangeType),
    staleTime: 5 * 60 * 1000,
  });

export const useDailyRecords = () =>
  useQuery<DailyFocus[]>({
    queryKey: recordKeys.daily(),
    queryFn: getDailyRecords,
    staleTime: 5 * 60 * 1000,
  });
