"use client";

import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export type DonutCategory = {
  category: string;
  minutes: number;
  color: string;
};

interface DonutGraphProps {
  totalMinutes: number;
  categories: DonutCategory[];
  cutout?: string | number;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function formatHM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}h ${pad2(m)}m`;
}

export default function DonutGraph({
  totalMinutes,
  categories,
  cutout = "60%",
}: DonutGraphProps) {
  const safeTotal = Math.max(0, totalMinutes);
  const percents =
    safeTotal > 0
      ? categories.map((c) => (c.minutes / safeTotal) * 100)
      : categories.map(() => 0);

  const chartData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        data: percents,
        backgroundColor: categories.map((c) => c.color),
        borderWidth: 0,
        spacing: 0,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const i = ctx.dataIndex;
            const minutes = categories[i]?.minutes ?? 0;
            const pct = percents[i] ?? 0;
            return `${ctx.label} — ${Math.round(pct)}% (${formatHM(minutes)})`;
          },
        },
      },
      datalabels: {
        color: "#fff",
        font: { size: 16, weight: 600 },
        formatter: (_value, ctx) => {
          const i = ctx.dataIndex;
          const pct = percents[i] ?? 0;
          return pct >= 1 ? `${Math.round(pct)}%` : ""; // 1% 미만은 숨김
        },
        clamp: true,
        clip: false,
      },
    },
  };

  return (
    <div style={{ width: 240, height: 240 }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
