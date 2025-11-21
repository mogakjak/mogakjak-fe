import type { Todo, TodoCategoryWithTodos } from "../../_types/todo";

const TODO_BASE = "/api/todos";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${TODO_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err?.message || err?.error || message;
    } catch {
      // noop – fallback to default message
    }
    throw new Error(message);
  }

  const json = await res
    .json()
    .catch(() => undefined) as
    | { statusCode?: number; message?: string; data?: unknown }
    | undefined;

  if (json && typeof json.statusCode === "number") {
    const code = json.statusCode;
    const isSuccess = code === 0 || (code >= 200 && code < 300);
    if (!isSuccess) {
      throw new Error(json?.message ?? `HTTP ${code}`);
    }
    return json?.data as T;
  }

  return json as T;
}

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

export const getTodayTodos = () => request<TodoCategoryWithTodos[]>("/today", { method: "GET" });

export const getMyTodos = () => request<Todo[]>("/my", { method: "GET" });

export const createTodo = (payload: CreateTodoPayload) =>
  request<Todo>("/", { method: "POST", body: JSON.stringify(payload) });

export const updateTodo = (todoId: string, payload: UpdateTodoPayload) =>
  request<Todo>(`/${todoId}`, { method: "PUT", body: JSON.stringify(payload) });

export const toggleTodoComplete = (todoId: string) =>
  request<Todo>(`/${todoId}/complete`, { method: "PATCH" });

export const deleteTodo = (todoId: string) =>
  request<void>(`/${todoId}`, { method: "DELETE" });

