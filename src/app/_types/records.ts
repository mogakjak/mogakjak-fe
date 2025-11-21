export type RecordSummary = {
  totalSeconds: number;
  groupSeconds: number;
  personalSeconds: number;
  completedTodoCount: number;
};

export type HourlyFocus = {
  hour: number;
  totalSeconds: number;
};

import type { CategoryColorToken } from "./category";

export type CategoryFocus = {
  categoryId: string;
  categoryName: string;
  color: CategoryColorToken | string;
  totalSeconds: number;
  completedTodoCount: number;
  totalTodoCount: number;
};

export type DailyFocus = {
  date: string;
  totalSeconds: number;
  dayOfWeek: number;
};

export type RecordDashboard = {
  summary: RecordSummary;
  hourlyFocus: HourlyFocus[];
  categoryFocus: CategoryFocus[];
  dailyFocus: DailyFocus[];
};
