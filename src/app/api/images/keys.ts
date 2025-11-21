export const imagesKeys = {
  all: () => ["images"] as const,
  presigned: (prefix: string, fileName: string) =>
    [...imagesKeys.all(), "presigned", prefix, fileName] as const,
};
