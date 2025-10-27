"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import GroupModal from "./groupModal";
import ToggleButton from "../toggleButton";

export default function NotiModal() {
  const [value, setValue] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(0, Math.min(99, Number(e.target.value)));
    setValue(v);
  };
  return (
    <GroupModal>
      <div className="flex flex-col px-7 py-4">
        <h2 className="text-heading4-20SB text-center">집중 체크 알림</h2>
        <p className="text-body1-16R text-gray-700 mt-2">
          그룹원들의 집중 유지를 위한 주기적 알림 장치입니다.
        </p>

        <p className="text-body1-16SB mt-7">알림 기능 사용</p>
        <div className="flex gap-3 items-center mt-3 mb-7">
          <ToggleButton></ToggleButton>
          <p className="text-body2-14R text-gray-600">알림을 안 받을래요</p>
        </div>

        <p className="text-body1-16SB mt-7">알림 주기</p>
        <div className="bg-gray-100 px-5 py-3 rounded-lg w-full border border-gray-200 mt-3 mb-7">
          <input
            type="number"
            value={String(value).padStart(2, "0")}
            onChange={handleChange}
            className="
        w-full
        text-body1-16SB
        bg-gray-100 text-center
        text-gray-800 
        border-none outline-none 
        [appearance:textfield] 
      "
          />
        </div>

        <p className="text-body1-16SB mt-7">알림 메시지</p>
        <div className="bg-gray-100 px-5 py-3 rounded-lg w-full border border-gray-200 mt-3 mb-7">
          <input
            type="text"
            className="border-none outline-none "
            placeholder="텍스트를 입력해주세요"
          />
        </div>
        <div className="mx-25">
          <Button className="w-full" leftIcon={null}>
            설정 완료
          </Button>
        </div>
      </div>
    </GroupModal>
  );
}
