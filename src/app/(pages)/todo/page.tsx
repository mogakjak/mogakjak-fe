"use client";

import { useState } from "react";
import Category, {
  type Category as CategoryType,
  type DayFilter,
} from "./components/category";

export default function TodoPage() {
  const [filter, setFilter] = useState<DayFilter>("today");
  const [selectedId, setSelectedId] = useState<string>("all");

  const [categories] = useState<CategoryType[]>([]);


  return (
    <main className="min-h-screen bg-gray-100 flex">
      <div className="flex-shrink-0">
        <Category
          filter={filter}
          onChangeFilter={setFilter}
          categories={categories}
          selectedId={selectedId}
          onSelect={setSelectedId}
          className="mt-10 ml-10 shadow-md"
        />
      </div>
      <div className="flex-1 p-10">
        <div className="text-gray-700 text-lg font-medium">
          할 일 목록 들어갈 예정. 
        </div>
      </div>
    </main>
  );
}
