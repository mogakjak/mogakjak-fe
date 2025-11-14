import type { TodoCategoryColor } from "./categories/types";

export type Todo = {
  id: string;
  categoryId: string;
  task: string;
  date: string; // YYYY-MM-DD
  targetTimeInSeconds: number;
  actualTimeInSeconds: number;
  isCompleted: boolean;
};

export type TodoCategoryWithTodos = {
  id: string;
  name: string;
  color: TodoCategoryColor;
  displayOrder: number;
  isExpanded: boolean;
  todos: Todo[];
};

