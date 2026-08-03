"use client";

import { useRecordDashboard } from "@/app/_hooks/records/useRecordDashboard";
import ChartMain from "./chart/chartMain";
import Cards from "./data/cards";
import Tabs from "./tabs/tabs";
import { useEffect, useState } from "react";
import { TabType } from "@/app/_utils/tabType";
import { sendGAEvent } from "@next/third-parties/google";

export default function DashBorad() {
  const [selectedTab, setSelectedTab] = useState("오늘");
  const rangeType = TabType(selectedTab);

  const { data, isPending } = useRecordDashboard(rangeType);

  useEffect(() => {
    sendGAEvent("event", "record_view", {
      tab: "dashboard",
      period: rangeType,
    });
  }, [rangeType]);

  return (
    <div className="w-full bg-white rounded-[20px] px-10 py-7">
      <Tabs onChange={setSelectedTab} defaultValue="오늘" />
      <Cards
        totalFocusSec={data?.summary.totalSeconds ?? 0}
        groupFocusSec={data?.summary.groupSeconds ?? 0}
        personalFocusSec={data?.summary.personalSeconds ?? 0}
        doneTasks={data?.summary.completedTodoCount ?? 0}
        isPending={isPending}
      />
      <ChartMain data={data} isPending={isPending} />
    </div>
  );
}
