"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import Image from "next/image";
import { ImageSelector } from "./ImageSelector";
import { useCreateGroup, useUpdateGroup } from "@/app/_hooks/groups";

interface RoomModalProps {
  onClose: () => void;
  mode: "create" | "edit";
  groupId?: string;
  initialName?: string;
  initialImageUrl?: string | null;
}

export default function RoomModal({
  onClose,
  mode,
  groupId,
  initialName = "",
  initialImageUrl = null,
}: RoomModalProps) {
  const [name, setName] = useState(initialName);
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);

  const { mutate: createGroup, isPending: isCreating } = useCreateGroup();
  const { mutate: updateGroup, isPending: isUpdating } = useUpdateGroup();

  const isEdit = mode === "edit";
  const isPending = isEdit ? isUpdating : isCreating;
  const title = isEdit ? "그룹 수정하기" : "그룹 생성하기";
  const buttonLabel = isEdit ? "수정하기" : "생성하기";

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("그룹 이름을 입력해주세요.");
      return;
    }

    const payload = {
      name,
      imageUrl: imageUrl ?? "",
    };

    if (isEdit) {
      if (!groupId) {
        console.error("groupId가 없습니다.");
        return;
      }

      updateGroup(
        { groupId, body: payload },
        {
          onSuccess: () => {
            onClose();
          },
          onError: () => {
            alert("그룹 수정에 실패했습니다.");
          },
        }
      );
    } else {
      createGroup(payload, {
        onSuccess: () => {
          onClose();
        },
        onError: () => {
          alert("그룹 생성에 실패했습니다.");
        },
      });
    }
  };

  return (
    <div className="bg-white p-5 w-[516px] rounded-[20px]">
      <button className="flex ml-auto" onClick={onClose}>
        <Image src="/Icons/xmark.svg" alt="닫기" width={24} height={24} />
      </button>

      <div className="p-5 flex flex-col items-center">
        <h2 className="text-heading4-20SB mb-[27px] text-center">{title}</h2>

        <ImageSelector
          initialImageUrl={initialImageUrl}
          onChange={(_, previewUrl) => {
            setImageUrl(previewUrl);
          }}
        />

        <div className="flex flex-col gap-2 w-full">
          <p className="text-body1-16SB">그룹 이름</p>
          <input
            placeholder="그룹 이름을 설정하세요."
            type="text"
            className="text-body2-14R rounded-lg py-2 px-3 bg-gray-100 border border-gray-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <Button
          className="px-10 mt-7"
          leftIcon={null}
          onClick={handleSubmit}
          disabled={isPending}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
