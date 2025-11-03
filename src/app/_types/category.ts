import { WorkItemProps } from "../(pages)/todo/components/workItem";

export type Category = {
  id: string | number;
  title: string;
  barColorClass: string;
  items: WorkItemProps[];
  expanded?: boolean;
};
