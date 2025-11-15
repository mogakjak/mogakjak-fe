import type { TodoCategory, TodoCategoryColor } from "../../../_types/todoCategory";

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

export type CreateTodoCategoryPayload = {
  name: string;
  color: TodoCategoryColor;
};

export type UpdateTodoCategoryPayload = {
  categoryId: string;
  name?: string;
  color?: TodoCategoryColor;
  isExpanded?: boolean;
};

export type ReorderTodoCategoriesPayload = {
  categoryIds: string[];
};

export const getTodoCategories = () => request<TodoCategory[]>("/categories", { method: "GET" });

export const createTodoCategory = (payload: CreateTodoCategoryPayload) =>
  request<TodoCategory>("/categories", { method: "POST", body: JSON.stringify(payload) });

const isMethodNotAllowed = (error: unknown) =>
  error instanceof Error && /405/.test(error.message);

export const updateTodoCategory = async ({ categoryId, ...rest }: UpdateTodoCategoryPayload) => {
  const basePayload = JSON.stringify({ categoryId, ...rest });
  const pathPayload = JSON.stringify(rest);

  try {
    return await request<TodoCategory>("/categories", {
      method: "PATCH",
      body: basePayload,
    });
  } catch (error) {
    if (!isMethodNotAllowed(error)) {
      try {
        return await request<TodoCategory>(`/categories/${categoryId}`, {
          method: "PATCH",
          body: pathPayload,
        });
      } catch (innerError) {
        if (isMethodNotAllowed(innerError)) {
          return request<TodoCategory>(`/categories/${categoryId}`, {
            method: "PUT",
            body: pathPayload,
          });
        }
        throw innerError;
      }
    }
    return request<TodoCategory>(`/categories/${categoryId}`, {
      method: "PUT",
      body: pathPayload,
    });
  }
};

export const reorderTodoCategories = (payload: ReorderTodoCategoriesPayload) =>
  request<void>("/categories/order", { method: "PATCH", body: JSON.stringify(payload) });

export const deleteTodoCategory = (categoryId: string) =>
  request<void>(`/categories/${categoryId}`, { method: "DELETE" });

