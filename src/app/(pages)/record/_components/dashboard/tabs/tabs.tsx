"use client";

import React, { useState } from "react";
import TabButton from "./tabButton";

const tabList = ["오늘", "이번 주", "이번 달", "전체"];

interface TabsProps {
  onChange: (value: string) => void;
  defaultValue?: string;
}

export default function Tabs({ onChange, defaultValue = "오늘" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleClick = (tab: string) => {
    setActiveTab(tab);
    onChange(tab);
  };

  return (
    <div className="flex">
      {tabList.map((tab) => (
        <TabButton
          key={tab}
          label={tab}
          active={activeTab === tab}
          onClick={() => handleClick(tab)}
        />
      ))}
      <div className="border-b-2 border-gray-200 w-full"></div>
    </div>
  );
}
