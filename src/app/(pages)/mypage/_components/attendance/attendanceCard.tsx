"use client";

import Image from "next/image";
import clsx from "clsx";
import type { AttendanceDay } from "@/app/_types/mypage";

type AttendanceStatus = "present" | "absent" | "today" | "yet";

const GRAPHIC: Record<AttendanceStatus, string> = {
  present: "/attendance/present.svg",
  absent: "/attendance/absent.svg",
  today: "/attendance/yet.svg",
  yet: "/attendance/yet.svg",
};

const DAY_STYLE: Record<AttendanceStatus, string> = {
  present: "bg-red-50 text-red-500 text-body1-16R",
  absent: "bg-gray-100 text-gray-400 text-body1-16R",
  today: "bg-white border-2 border-red-500 text-red-500 text-body1-16SB",
  yet: "bg-white text-black text-body1-16R",
};

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "출석",
  absent: "결석",
  today: "오늘",
  yet: "예정",
};

const getStatus = (day: AttendanceDay): AttendanceStatus => {
  if (day.today) return "today";
  if (day.future) return "yet";
  return day.attended ? "present" : "absent";
};

// "2026-10-19" → "10/19", "2026.10.19"
const parseDate = (date: string) => {
  const [y, m, d] = date.slice(0, 10).split("-");
  return {
    label: `${Number(m)}/${Number(d)}`,
    full: `${y}.${m}.${d}`,
  };
};

export default function AttendanceCard({
  referenceDate,
  days = [],
}: {
  referenceDate?: string;
  days?: AttendanceDay[];
}) {
  return (
    <section className="w-full p-6 rounded-[20px] bg-white flex flex-col gap-5">
      <div className="flex items-center justify-between py-1.5">
        <h2 className="text-heading4-20SB text-black">출석체크</h2>
        {referenceDate && (
          <p className="text-body2-14R text-gray-500">
            {parseDate(referenceDate).full}
          </p>
        )}
      </div>

      <ul className="flex items-center justify-between px-4 min-h-[118px]">
        {days.map((day) => {
          const status = getStatus(day);
          const { label } = parseDate(day.date);
          // 오늘은 출석 인정되면 출석 도장을 보여줌
          const graphic =
            status === "today" && day.attended
              ? GRAPHIC.present
              : GRAPHIC[status];

          return (
            <li
              key={day.date}
              className="w-[72px] flex flex-col items-center gap-4"
              aria-label={`${label} ${STATUS_LABEL[status]}`}
            >
              <Image src={graphic} alt="" width={72} height={72} />
              <span
                className={clsx(
                  "px-4 py-1 rounded-[80px] whitespace-nowrap",
                  DAY_STYLE[status],
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
