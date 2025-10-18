"use client";

import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Title,
  TooltipItem,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Title);

interface StickGraphsProps {
  data: number[];
}

const labels24 = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}시`
);

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

export default function StickGraphs({ data }: StickGraphsProps) {
  const chartData = useMemo(() => {
    const processed = (data ?? []).map((v) => (v && v > 0 ? v : null));
    return {
      labels: labels24,
      datasets: [
        {
          label: "몰입도",
          data: processed,
          backgroundColor: "#fb7055",
          borderRadius: {
            topLeft: 8,
            topRight: 8,
            bottomLeft: 0,
            bottomRight: 0,
          },
          borderSkipped: false,
          barThickness: 18,
          minBarLength: 2,
        },
      ],
    };
  }, [data]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#6B7280",
            font: { size: 12 },
          },
        },
        y: {
          min: 0,
          max: 100,
          beginAtZero: true,
          grid: { display: false },
          ticks: { display: false },
          display: false,
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "white",
          bodyColor: "#323437",
          borderColor: "#E5E7EB",
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: false,
          bodyFont: { size: 13, weight: 600 },
          callbacks: {
            title: () => "",
            label: (ctx: TooltipItem<"bar">) =>
              `${formatTime(ctx.parsed.y ?? 0)}`,
          },
        },
      },
      layout: {
        padding: { top: 4, right: 8, bottom: 0, left: 8 },
      },
    }),
    []
  );

  return (
    <div className="w-full" style={{ height: 200 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
