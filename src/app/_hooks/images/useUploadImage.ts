"use client";

import { useMutation } from "@tanstack/react-query";
import { getPresignedImageUrl } from "@/app/api/images/api";

type UploadImageVariables = {
  prefix: string;
  file: File;
};

export const useUploadImage = () => {
  return useMutation<string, Error, UploadImageVariables>({
    mutationFn: async ({ prefix, file }) => {
      const { presignedUrl, imageUrl } = await getPresignedImageUrl({
        prefix,
        fileName: file.name,
      });

      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error("이미지 업로드에 실패했습니다.");
      }

      // 3) 최종 사용용 URL 반환
      return imageUrl;
    },
  });
};

