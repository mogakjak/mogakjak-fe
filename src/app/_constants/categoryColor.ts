import type { TodoCategoryColor } from "../_types/todoCategory";
import type { CategoryColorToken } from "../_types/category";

export const CATEGORY_COLOR_TOKEN_BY_NAME: Record<
  TodoCategoryColor,
  CategoryColorToken
> = {
  RED: "category-1-red",
  ORANGE: "category-2-orange",
  YELLOW: "category-3-yellow",
  GREEN: "category-4-green",
  BLUE: "category-5-skyblue",
  INDIGO: "category-6-blue",
  PURPLE: "category-7-purple",
};

export const CATEGORY_COLOR_TOKENS = Object.values(
  CATEGORY_COLOR_TOKEN_BY_NAME
);

export const CATEGORY_COLOR_NAME_BY_TOKEN = Object.entries(
  CATEGORY_COLOR_TOKEN_BY_NAME
).reduce<Record<string, TodoCategoryColor>>((acc, [name, token]) => {
  acc[token] = name as TodoCategoryColor;
  return acc;
}, {});

