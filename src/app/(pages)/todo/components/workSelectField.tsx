"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import type { Todo } from "@/app/_types/todo";

interface WorkSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  todayTodos?: Todo[];
}

const initialCategories: string[] = [];

export default function WorkSelectField({
  value,
  onChange,
  todayTodos = [],
}: WorkSelectFieldProps) {
  const todayTodoTasks = useMemo(() => {
    return todayTodos.map((todo) => todo.task);
  }, [todayTodos]);
  const allOptions = useMemo(() => {
    const combined = [...initialCategories, ...todayTodoTasks];
    return Array.from(new Set(combined));
  }, [todayTodoTasks]);

  const [categories, setCategories] = useState(allOptions);
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  useEffect(() => {
    setCategories(allOptions);
  }, [allOptions]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (category: string) => {
    onChange(category);
    setIsOpen(false);
  };

  const handleAddNew = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newCategory.trim() !== "") {
      const newItem = newCategory.trim();

      if (!categories.includes(newItem)) {
        setCategories([...categories, newItem]);
      }

      setNewCategory("");
      e.preventDefault();
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="self-stretch h-11 w-full px-4 py-2 bg-gray-100 rounded-lg outline-1 outline-gray-200 inline-flex justify-between items-center"
      >
        <span
          className={`text-body2-14R ${value ? "text-neutral-900" : "text-gray-400"
            }`}
        >
          {value || "할 일을 선택해 주세요."}
        </span>
        <Image
          src={isOpen ? "/Icons/arrowUpGray.svg" : "/Icons/arrowDownGray.svg"}
          alt="열기"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      </button>

      {isOpen && (
        <div className="absolute px-2 z-50 left-0 right-0 mt-2">
          <div className=" p-2 flex flex-col shadow-[0_0_4px_0_rgba(0,0,0,0.10)] bg-white border border-gray-100 rounded-lg z-10 overflow-hidden">
            <div className="max-h-40 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category}
                  onClick={() => handleSelect(category)}
                  className="text-body2-14R px-4 py-2.5  cursor-pointer"
                >
                  {category}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2  border border-gray-200 rounded-lg px-4 py-2">
              <Image
                src="/Icons/plusFilled.svg"
                alt="add"
                width={24}
                height={24}
              />
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={handleAddNew}
                placeholder="새 작업 추가"
                className="w-full outline-none text-body2-14R"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
