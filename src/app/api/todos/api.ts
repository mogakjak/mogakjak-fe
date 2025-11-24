import type { Todo, TodoCategoryWithTodos } from "../../_types/todo";
import { request } from "../request";

const TODO_BASE = "/api/todos";

export type CreateTodoPayload = {
  categoryId: string;
  task: string;
  date: string; // YYYY-MM-DD
  targetTimeInSeconds: number;
};

export type UpdateTodoPayload = {
  categoryId?: string;
  task?: string;
  date?: string;
  targetTimeInSeconds?: number;
};

export const getTodayTodos = () => request<TodoCategoryWithTodos[]>(TODO_BASE, "/today", { method: "GET" });

export const getMyTodos = () => request<Todo[]>(TODO_BASE, "/my", { method: "GET" });

export const createTodo = (payload: CreateTodoPayload) =>
  request<Todo>(TODO_BASE, "/", { method: "POST", body: JSON.stringify(payload) });

export const updateTodo = (todoId: string, payload: UpdateTodoPayload) =>
  request<Todo>(TODO_BASE, `/${todoId}`, { method: "PUT", body: JSON.stringify(payload) });

export const toggleTodoComplete = (todoId: string) =>
  request<Todo>(TODO_BASE, `/${todoId}/complete`, { method: "PATCH" });

export const deleteTodo = (todoId: string) =>
  request<void>(TODO_BASE, `/${todoId}`, { method: "DELETE" });

