export type PresignedImage = {
  presignedUrl: string;
  imageUrl: string;
};

export type GetPresignedUrlParams = {
  prefix: string;
  fileName: string;
};
