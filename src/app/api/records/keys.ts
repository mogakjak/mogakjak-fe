export const recordKeys = {
  all: ["records"] as const,
  dashboard: (rangeType: string) =>
    [...recordKeys.all, "dashboard", rangeType] as const,
  daily: () => [...recordKeys.all, "daily"] as const,
};
