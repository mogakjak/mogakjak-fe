import type { TodoCategoryColor } from "./todoCategory";

export type Todo = {
  id: string;
  categoryId: string;
  task: string;
  date: string; // YYYY-MM-DD
  /** 목표 시간 미설정 시 null */
  targetTimeInSeconds: number | null;
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

