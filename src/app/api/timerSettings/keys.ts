export const timerSettingsKeys = {
  all: ["timer-settings"] as const,
  tabOrder: () => [...timerSettingsKeys.all, "tab-order"] as const,
};
