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

export type CategoryFocus = {
  categoryId: string;
  categoryName: string;
  color: string;
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
