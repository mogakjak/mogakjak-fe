import { useQuery } from "@tanstack/react-query";
import { getTotalStudyTime } from "@/app/api/mypage/api";
import { mypageKeys } from "@/app/api/mypage/keys";
import type { TotalStudyTimeResponse } from "@/app/_types/mypage";

export const useTotalStudyTime = () =>
    useQuery<TotalStudyTimeResponse>({
        queryKey: mypageKeys.totalStudyTime(),
        queryFn: getTotalStudyTime,
        staleTime: 5 * 60 * 1000,
    });
