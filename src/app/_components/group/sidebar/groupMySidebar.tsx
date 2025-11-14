"use client";

import { useState } from "react";

import Icon from "../../common/Icons";
import Edit from "/Icons/edit.svg";
import Book from "/Icons/book.svg";
import Clock from "/Icons/stopwatch.svg";
import AddWorkForm, {
  AddWorkPayload,
} from "@/app/(pages)/todo/components/addWorkForm";
import { categoriesData } from "@/app/_utils/mockData";
import { CategoryOption } from "@/app/(pages)/todo/components/categorySelect";
import VisibilityToggle from "./visibilityButton";

export default function GroupMySidebar() {
  const [isTaskOpen, setIsTaskOpen] = useState(true);
  const [isTimeOpen, setIsTimeOpen] = useState(true);
  const [selectedWork, setSelectedWork] = useState<AddWorkPayload | null>(null);

  const formatSeconds = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const secs = String(safeSeconds % 60).padStart(2, "0");
    return `${hours} : ${minutes} : ${secs}`;
  };

  const [modalOpen, setModalOpen] = useState(false);

  const handleWorkSubmit = (payload: AddWorkPayload) => {
    setSelectedWork(payload);
    setModalOpen(false);
  };

  return (
    <div className=" bg-white rounded-2xl">
      <div className="border rounded-lg border-gray-200 p-3">
        <div className="flex items-center">
          <Icon Svg={Book} size={24} className={"text-gray-400"} />
          <p className="text-body2-14SB ml-1">
            {selectedWork?.title ?? "와이어프레임 완료"}
          </p>

          <button className="ml-auto" onClick={() => setModalOpen(true)}>
            <Icon Svg={Edit} size={24} className="text-gray-600" />
          </button>
        </div>
        <VisibilityToggle
          isTaskOpen={isTaskOpen}
          setIsTaskOpen={setIsTaskOpen}
        />
        <div className="flex flex-col gap-1 mt-3">
          <div className="flex items-center">
            <Icon Svg={Clock} size={24} className={"text-gray-400"} />
            <h3 className="text-body2-14SB ml-1">00 : 00 : 00</h3>
          </div>
          <VisibilityToggle
            isTaskOpen={isTimeOpen}
            setIsTaskOpen={setIsTimeOpen}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-2 bg-gray-100 rounded-lg px-4 py-3">
        <p className="text-caption-12SB text-gray-600">
          <b className="text-black mr-2">목표시간</b>{" "}
          {formatSeconds(selectedWork?.targetSeconds ?? 0)}
        </p>
        <p className="text-caption-12SB text-gray-600">
          <b className="text-black mr-2">현재 달성률</b> 50%
        </p>
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
