export type TodoCategoryColor =
  | "RED"
  | "ORANGE"
  | "YELLOW"
  | "GREEN"
  | "BLUE"
  | "INDIGO"
  | "PURPLE";

export type TodoCategory = {
  id: string;
  name: string;
  color: TodoCategoryColor;
  displayOrder: number;
  isExpanded: boolean;
};

