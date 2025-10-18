"use client";

import React, { useState } from "react";
import TabButton from "./tabButton";

const tabList = ["오늘", "이번 주", "이번 달", "전체"];

export default function Tabs() {
  const [activeTab, setActiveTab] = useState("오늘");

  return (
    <div className="flex">
      {tabList.map((tab) => (
        <TabButton
          key={tab}
          label={tab}
          active={activeTab === tab}
          onClick={() => setActiveTab(tab)}
        />
      ))}
      <div className="border-b-2 border-gray-200 w-full"></div>
    </div>
  );
}
