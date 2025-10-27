"use client";

import Icon from "./Icons";

import Edit from "/Icons/edit.svg";
import Check from "/Icons/check.svg";

interface GroupQuoteCTAProps {
  mode: "edit" | "check";
  onToggle: () => void;
}

export default function GroupQuoteCTA({ mode, onToggle }: GroupQuoteCTAProps) {
  const isEdit = mode === "edit";

  return (
    <button
      type="button"
      onClick={onToggle}
      title={isEdit ? "완료" : "수정하기"}
      aria-pressed={!isEdit}
      className={`flex items-center justify-center rounded-full p-2 transition-colors duration-200
        ${isEdit ? "bg-red-500" : "bg-gray-200"}`}
    >
      <Icon
        Svg={isEdit ? Check : Edit}
        size={24}
        className={isEdit ? "text-white" : "text-gray-600"}
      />
    </button>
  );
}
