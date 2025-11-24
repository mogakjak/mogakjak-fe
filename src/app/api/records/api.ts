import { DailyFocus, type RecordDashboard } from "@/app/_types/records";
import { request } from "../request";

const RECORD_BASE = "/api/records";

export const getRecordDashboard = (rangeType: string = "TODAY") =>
  request<RecordDashboard>(RECORD_BASE, `/dashboard?rangeType=${rangeType}`, {
    method: "GET",
  });

export const getDailyRecords = () =>
  request<DailyFocus[]>(RECORD_BASE, "/daily", {
    method: "GET",
  });
