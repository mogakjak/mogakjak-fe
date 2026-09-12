export const quoteKeys = {
  all: () => ["quotes"] as const,
  random: () => [...quoteKeys.all(), "random"] as const,
};
