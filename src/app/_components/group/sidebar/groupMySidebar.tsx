"use client";

import { useState } from "react";
import EyesTooltip from "./eyesTooltip";

import Icon from "../../common/Icons";
import Edit from "/Icons/edit.svg";
import EyesOpen from "/Icons/eyesOpen.svg";
import EyesClosed from "/Icons/eyesClosed.svg";
import AddWorkForm, {
  AddWorkPayload,
} from "@/app/(pages)/todo/components/addWorkForm";
import { categoriesData } from "@/app/_utils/mockData";
import { CategoryOption } from "@/app/(pages)/todo/components/categorySelect";

export default function GroupMySidebar() {
  const [isTaskOpen, setIsTaskOpen] = useState(true);
  const [isTimeOpen, setIsTimeOpen] = useState(true);
  const [selectedWork, setSelectedWork] = useState<AddWorkPayload | null>(null);

  const toggleTaskEye = () => {
    setIsTaskOpen((v) => !v);
  };

  const toggleTimeEye = () => {
    setIsTimeOpen((v) => !v);
  };

  const formatSeconds = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
    const minutes = String(
      Math.floor((safeSeconds % 3600) / 60)
    ).padStart(2, "0");
    const secs = String(safeSeconds % 60).padStart(2, "0");
    return `${hours} : ${minutes} : ${secs}`;
  };

  const [modalOpen, setModalOpen] = useState(false);

  const handleWorkSubmit = (payload: AddWorkPayload) => {
    setSelectedWork(payload);
    setModalOpen(false);
  };

  return (
    <div className="p-5 bg-white w-[238px] h-[512px] rounded-2xl">
      <h3 className="text-body1-16SB">할 일</h3>

      <div className="flex items-center mt-2">
        <EyesTooltip text={isTaskOpen ? "공개" : "비공개"}>
          <button className="mr-2" onClick={toggleTaskEye}>
            <Icon
              Svg={isTaskOpen ? EyesOpen : EyesClosed}
              size={24}
              className="text-gray-600"
            />
          </button>
        </EyesTooltip>

        <p className="text-body2-14SB text-green">
          {selectedWork?.title ?? "와이어프레임 완료"}
        </p>

        <button className="ml-auto" onClick={() => setModalOpen(true)}>
          <Icon Svg={Edit} size={24} className="text-gray-600" />
        </button>
      </div>

      <div className="flex flex-col gap-1 mt-2 bg-gray-100 rounded-lg px-3 py-2">
        <p className="text-caption-12SB text-gray-600">
          <b className="text-black mr-2">목표시간</b> {formatSeconds(selectedWork?.targetSeconds ?? 0)}
        </p>
        <p className="text-caption-12SB text-gray-600">
          <b className="text-black mr-2">현재 달성률</b> 50%
        </p>
      </div>

      <div className="flex flex-col gap-1 py-5 my-5 border-t border-b border-gray-200">
        <div className="flex items-center">
          <EyesTooltip text={isTimeOpen ? "공개" : "비공개"}>
            <button className="mr-2" onClick={toggleTimeEye}>
              <Icon
                Svg={isTimeOpen ? EyesOpen : EyesClosed}
                size={24}
                className="text-gray-600"
              />
            </button>
          </EyesTooltip>

          <h3 className="text-body1-16SB">오늘 몰입 누적 시간</h3>
        </div>
        <p className="text-body2-14SB text-red-500">00 : 00 : 00</p>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <AddWorkForm
            type="select"
            categories={categoriesData.map((c) => ({
              id: String(c.id),
              name: c.title,
              colorToken: "category-1-red" as CategoryOption["colorToken"],
            }))}
            onSubmit={handleWorkSubmit}
            onClose={() => setModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
