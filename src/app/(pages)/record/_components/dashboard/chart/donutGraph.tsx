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
import { formatHMS } from "../../../_utils/formatHMS";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export type DonutCategory = {
  category: string;
  seconds: number;
  color: string;
};

interface DonutGraphProps {
  totalSeconds: number;
  categories: DonutCategory[];
  cutout?: string | number;
}

export default function DonutGraph({
  totalSeconds,
  categories,
  cutout = "60%",
}: DonutGraphProps) {
  const safeTotal = Math.max(0, totalSeconds);

  const percents =
    safeTotal > 0
      ? categories.map((c) => (c.seconds / safeTotal) * 100)
      : categories.map(() => 0);

  const datasetData = safeTotal > 0 ? percents : categories.map(() => 1);

  const chartData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        data: datasetData,
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
            const seconds = categories[i]?.seconds ?? 0;
            const pct = percents[i] ?? 0;
            return `${ctx.label} — ${Math.round(pct)}% (${formatHMS(seconds)})`;
          },
        },
      },
      datalabels: {
        color: "#fff",
        font: { size: 16, weight: 600 },
        formatter: (_value, ctx) => {
          const i = ctx.dataIndex;
          const pct = percents[i] ?? 0;
          if (safeTotal === 0) return "0%";
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
