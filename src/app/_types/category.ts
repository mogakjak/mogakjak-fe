import { WorkItemProps } from "../(pages)/todo/components/workItem";

export type CategoryColorToken =
  | "category-1-red"
  | "category-2-orange"
  | "category-3-yellow"
  | "category-4-green"
  | "category-5-skyblue"
  | "category-6-blue"
  | "category-7-purple";

export type Category = {
  id: string | number;
  title: string;
  barColorClass: string;
  colorToken?: CategoryColorToken;
  items: (WorkItemProps & { id?: string })[];
  expanded?: boolean;
};
