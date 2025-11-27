export const characterKeys = {
  all: () => ["characters"] as const,
  checkAward: () => [...characterKeys.all(), "checkAward"] as const,
};
