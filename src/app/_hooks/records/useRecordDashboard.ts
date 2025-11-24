"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecordDashboard } from "../../api/records/api";
import { recordKeys } from "../../api/records/keys";
import type { RecordDashboard } from "../../_types/records";

export const useRecordDashboard = (rangeType: string = "TODAY") =>
  useQuery<RecordDashboard>({
    queryKey: recordKeys.dashboard(rangeType),
    queryFn: () => getRecordDashboard(rangeType),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });

