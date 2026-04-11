export const loungeKeys = {
  all: () => ["lounge"] as const,
  summary: () => [...loungeKeys.all(), "summary"] as const,
};
