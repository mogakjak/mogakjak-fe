"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface ImageSelectorProps {
  initialImageUrl?: string | null; // 수정 모드일 때 기본 이미지
  onChange?: (file: File | null, previewUrl: string | null) => void;
}

export function ImageSelector({
  initialImageUrl = null,
  onChange,
}: ImageSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialImageUrl);

  useEffect(() => {
    setPreview(initialImageUrl ?? null);
  }, [initialImageUrl]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file, url);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`
    w-[88px] h-[88px] flex items-center border border-gray-300 justify-center rounded-lg mb-5 overflow-hidden
    ${preview ? "" : "border-2 border-dotted"}
  `}
      >
        {preview ? (
          <img
            src={preview}
            alt="그룹 이미지 미리보기"
            className="w-full h-full object-cover"
          />
        ) : (
          <Image src="/Icons/camera.svg" alt="카메라" width={36} height={36} />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
