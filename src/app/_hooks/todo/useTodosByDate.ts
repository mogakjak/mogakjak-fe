"use client";

import {
    useQuery,
    type UseQueryOptions,
} from "@tanstack/react-query";
import { getTodosByDate } from "../../api/todos/api";
import { todoKeys } from "../../api/todos/keys";
import type { TodoCategoryWithTodos } from "../../_types/todo";

/**
 * 특정 날짜의 카테고리별 할 일 목록 조회
 * @param date YYYY-MM-DD 형식
 */
export const useTodosByDate = (
    date: string,
    options?: Omit<UseQueryOptions<TodoCategoryWithTodos[], Error>, "queryKey" | "queryFn">
) =>
    useQuery<TodoCategoryWithTodos[], Error>({
        queryKey: todoKeys.byDate(date),
        queryFn: () => getTodosByDate(date),
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        enabled: !!date,
        ...options,
    });
