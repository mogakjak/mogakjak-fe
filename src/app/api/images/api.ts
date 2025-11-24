import type {
  GetPresignedUrlParams,
  PresignedImage,
} from "@/app/_types/images";
import { request } from "../request";

const IMAGE_BASE = "/api/images";

export const getPresignedImageUrl = (params: GetPresignedUrlParams) => {
  const query = new URLSearchParams({
    prefix: params.prefix,
    fileName: params.fileName,
  }).toString();

  return request<PresignedImage>(IMAGE_BASE, `/presigned-url?${query}`, {
    method: "GET",
  });
};
