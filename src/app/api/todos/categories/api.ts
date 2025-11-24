import type { TodoCategory, TodoCategoryColor } from "../../../_types/todoCategory";
import { request } from "../../request";

const TODO_BASE = "/api/todos";

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

export const getTodoCategories = () => request<TodoCategory[]>(TODO_BASE, "/categories", { method: "GET" });

export const createTodoCategory = (payload: CreateTodoCategoryPayload) =>
  request<TodoCategory>(TODO_BASE, "/categories", { method: "POST", body: JSON.stringify(payload) });

const isMethodNotAllowed = (error: unknown) =>
  error instanceof Error && /405/.test(error.message);

export const updateTodoCategory = async ({ categoryId, ...rest }: UpdateTodoCategoryPayload) => {
  const basePayload = JSON.stringify({ categoryId, ...rest });
  const pathPayload = JSON.stringify(rest);

  try {
    return await request<TodoCategory>(TODO_BASE, "/categories", {
      method: "PATCH",
      body: basePayload,
    });
  } catch (error) {
    if (!isMethodNotAllowed(error)) {
      try {
        return await request<TodoCategory>(TODO_BASE, `/categories/${categoryId}`, {
          method: "PATCH",
          body: pathPayload,
        });
      } catch (innerError) {
        if (isMethodNotAllowed(innerError)) {
          return request<TodoCategory>(TODO_BASE, `/categories/${categoryId}`, {
            method: "PUT",
            body: pathPayload,
          });
        }
        throw innerError;
      }
    }
    return request<TodoCategory>(TODO_BASE, `/categories/${categoryId}`, {
      method: "PUT",
      body: pathPayload,
    });
  }
};

export const reorderTodoCategories = (payload: ReorderTodoCategoriesPayload) =>
  request<void>(TODO_BASE, "/categories/order", { method: "PATCH", body: JSON.stringify(payload) });

export const deleteTodoCategory = (categoryId: string) =>
  request<void>(TODO_BASE, `/categories/${categoryId}`, { method: "DELETE" });

