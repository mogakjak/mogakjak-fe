"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import Image from "next/image";
import { useUpdateProfile } from "@/app/_hooks/mypage/useUpdateProfile";
import { useUploadImage } from "@/app/_hooks/images/useUploadImage";
import type { ProfileUpdate } from "@/app/_types/mypage";

interface ProfileEditModalProps {
  onClose: () => void;
  initialNickname?: string;
  initialEmail?: string;
  initialImageUrl?: string;
}

export default function ProfileEditModal({
  onClose,
  initialNickname = "",
  initialEmail = "",
  initialImageUrl,
}: ProfileEditModalProps) {
  const [name, setName] = useState(initialNickname);
  const [email, setEmail] = useState(initialEmail);
  const [profileImage, setProfileImage] = useState<string | null>(
    initialImageUrl || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutateAsync: uploadImage } = useUploadImage();

  const handleSubmit = async () => {
    if (isPending) return;

    try {
      let finalImageUrl = profileImage;

      if (imageFile) {
        finalImageUrl = await uploadImage({
          prefix: "profiles",
          file: imageFile,
        });
      }

      const payload: ProfileUpdate = {};

      if (name.trim()) {
        payload.nickname = name.trim();
      }
      if (email.trim()) {
        payload.email = email.trim();
      }
      if (finalImageUrl) {
        payload.imageUrl = finalImageUrl;
      }

      if (Object.keys(payload).length === 0) return;

      updateProfile(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    } catch (error) {
      console.error(error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setProfileImage(url);
    setImageFile(file);
  };

  return (
    <div className="bg-white p-5 w-[516px] rounded-[20px]">
      <button className="flex ml-auto" onClick={onClose}>
        <Image src="/Icons/xmark.svg" alt="닫기" width={24} height={24} />
      </button>

      <div className="p-5 flex flex-col items-center">
        <h2 className="text-heading4-20SB mb-[27px] text-center">
          프로필 수정
        </h2>

        <div className="relative mb-5">
          <label className="w-[120px] h-[120px] rounded-full border-2 border-gray-300 bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden">
            <Image
              src={profileImage || "/profileDefault.svg"}
              alt="기본 이미지"
              fill
              className="object-cover rounded-full"
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
          <div className="absolute bottom-0 right-0 bg-gray-200 rounded-full p-2">
            <Image
              src="/Icons/camera.svg"
              alt="카메라"
              width={25}
              height={25}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-5 w-full">
          <p>이름</p>
          <input
            placeholder="이름"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg py-2 px-3 bg-gray-100 border border-gray-200"
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <p>이메일</p>
          <input
            placeholder="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg py-2 px-3 bg-gray-100 border border-gray-200"
          />
        </div>

        <Button
          onClick={handleSubmit}
          className="px-10 mt-7"
          leftIcon={null}
          disabled={isPending}
          variant={isPending ? "muted" : "primary"}
        >
          {isPending ? "수정 중..." : "수정하기"}
        </Button>
      </div>
    </div>
  );
}
