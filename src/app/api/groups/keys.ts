import type { GetMatesParams } from "./api";

export const groupKeys = {
  all: () => ["groups"] as const,
  my: () => [...groupKeys.all(), "my"] as const,
  mates: (params?: GetMatesParams) =>
    [...groupKeys.all(), "mates", params ?? {}] as const,
};
