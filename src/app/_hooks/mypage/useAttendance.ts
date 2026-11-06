"use client";

import { useQuery } from "@tanstack/react-query";
import { getAttendance } from "../../api/mypage/api";
import { mypageKeys } from "../../api/mypage/keys";
import type { MyPageAttendance } from "../../_types/mypage";

export const useAttendance = () =>
  useQuery<MyPageAttendance>({
    queryKey: mypageKeys.attendance(),
    queryFn: getAttendance,
    staleTime: 5 * 60 * 1000,
  });
