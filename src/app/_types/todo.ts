import type { TodoCategoryColor } from "./todoCategory";

export type Todo = {
  id: string;
  categoryId: string;
  task: string;
  date: string; // YYYY-MM-DD
  targetTimeInSeconds: number;
  actualTimeInSeconds: number;
  isCompleted: boolean;
  progressRate?: number; 
};

export type TodoCategoryWithTodos = {
  id: string;
  name: string;
  color: TodoCategoryColor;
  displayOrder: number;
  isExpanded: boolean;
  todos: Todo[];
};

