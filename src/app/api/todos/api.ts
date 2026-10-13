import type { Todo, TodoCategoryWithTodos } from "../../_types/todo";
import { request } from "../request";

const TODO_BASE = "/api/todos";

export type CreateTodoPayload = {
  categoryId: string;
  task: string;
  date: string; // YYYY-MM-DD
  /** null이면 목표 시간 없이 생성 (0은 BE에서 거부) */
  targetTimeInSeconds: number | null;
};

export type UpdateTodoPayload = {
  categoryId?: string;
  task?: string;
  date?: string;
  targetTimeInSeconds?: number | null;
};

export const getTodayTodos = () => request<TodoCategoryWithTodos[]>(TODO_BASE, "/today", { method: "GET" });

export const getTodosByDate = (date: string) =>
  request<TodoCategoryWithTodos[]>(TODO_BASE, `?date=${date}`, { method: "GET" });

export const getMyTodos = () => request<Todo[]>(TODO_BASE, "/my", { method: "GET" });

export const createTodo = (payload: CreateTodoPayload) =>
  request<Todo>(TODO_BASE, "/", { method: "POST", body: JSON.stringify(payload) });

export const updateTodo = (todoId: string, payload: UpdateTodoPayload) =>
  request<Todo>(TODO_BASE, `/${todoId}`, { method: "PUT", body: JSON.stringify(payload) });

export const toggleTodoComplete = (todoId: string) =>
  request<Todo>(TODO_BASE, `/${todoId}/complete`, { method: "PATCH" });

export const deleteTodo = (todoId: string) =>
  request<void>(TODO_BASE, `/${todoId}`, { method: "DELETE" });
