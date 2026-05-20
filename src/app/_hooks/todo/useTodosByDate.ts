"use client";

import {
    useQuery,
    type UseQueryOptions,
} from "@tanstack/react-query";
import { getTodayTodos, getTodosByDate } from "../../api/todos/api";
import { todoKeys } from "../../api/todos/keys";
import type { TodoCategoryWithTodos } from "../../_types/todo";
import { isTodayDateString } from "../../_utils/date";

/**
 * 특정 날짜의 카테고리별 할 일 목록 조회
 * @param date YYYY-MM-DD 형식
 * 오늘 날짜는 useTodayTodos와 동일한 쿼리 키·API를 사용해 캐시를 공유합니다.
 */
export const useTodosByDate = (
    date: string,
    options?: Omit<UseQueryOptions<TodoCategoryWithTodos[], Error>, "queryKey" | "queryFn">
) => {
    const isToday = isTodayDateString(date);

    return useQuery<TodoCategoryWithTodos[], Error>({
        queryKey: isToday ? todoKeys.today() : todoKeys.byDate(date),
        queryFn: () => (isToday ? getTodayTodos() : getTodosByDate(date)),
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        enabled: !!date,
        ...options,
    });
};
