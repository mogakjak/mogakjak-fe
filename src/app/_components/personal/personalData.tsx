"use client";

import { Button } from "@/components/button";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";
import GoalModal from "../group/modal/goalModal";

type TimeLike = number | string;

function formatTime(value: TimeLike): string {
  if (typeof value === "string") return value;
  const s = Math.max(0, Math.floor(value));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const dd = (n: number) => n.toString().padStart(2, "0");
  return `${dd(hh)} : ${dd(mm)} : ${dd(ss)}`;
}

export default function PersonalData({
  title = "할 일",
  taskName = "와이어프레임완료",
  targetTime = 0,
  progressPercent = 50,
  todayAccumulatedTime = 0,
  isAccumulating = false,
  className,
}: {
  title?: string;
  taskName?: string;
  targetTime?: TimeLike;
  progressPercent?: number;
  todayAccumulatedTime?: TimeLike;
  isAccumulating?: boolean;
  className?: string;
}) {
  const target = formatTime(targetTime);
  const accumulated = formatTime(todayAccumulatedTime);

  const [openReview, setOpenReview] = useState(false);
  const [openGoal, setOpenGoal] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenReview(false);
    };
    document.addEventListener("keydown", onKey);
    if (openReview) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [openReview]);

  return (
    <>
      <section
        className={clsx(
          "w-[327px] h-[546px] bg-neutral-50 rounded-[20px] flex flex-col justify-between items-start px-6 pt-9 pb-9 gap-6",
          className,
        )}
        aria-label="개인 데이터"
      >
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-neutral-900 text-xl font-semibold leading-7">
              {title}
            </h2>

            <div className="flex justify-between items-start">
              <p className="text-green-800 text-base font-semibold leading-6">
                {taskName}
              </p>
              <button
                type="button"
                aria-label="목표 수정"
                onClick={() => setOpenGoal(true)}
              >
                <Image
                  src="/Icons/edit.svg"
                  alt="편집"
                  width={24}
                  height={24}
                  className="w-6 h-6 cursor-pointer"
                />
              </button>
            </div>
            <div className="w-full px-5 py-4 bg-gray-100 rounded-lg flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-neutral-700 text-sm font-semibold leading-5">
                  목표 시간
                </span>
                <span className="text-zinc-600 text-sm font-semibold leading-5">
                  {target}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-700 text-sm font-semibold leading-5">
                  현재 달성률
                </span>
                <span className="text-zinc-600 text-sm font-semibold leading-5">
                  {Math.max(0, Math.min(100, progressPercent))}%
                </span>
              </div>
            </div>
          </div>
          <div className="w-full h-px bg-gray-200" />
          <div className="flex flex-col gap-3">
            <h3 className="text-neutral-900 text-xl font-semibold leading-7">
              오늘 몰입 누적 시간
            </h3>
            <span
              className={clsx(
                "text-base font-semibold leading-6",
                isAccumulating ? "text-red-500" : "text-gray-400",
              )}
            >
              {accumulated}
            </span>
          </div>
        </div>
        <div className="w-full mt-auto">
          <Button
            onClick={() => setOpenReview(true)}
            leftIconSrc="/Icons/timerOut.svg"
            className="w-full"
          >
            몰입 종료 후 나가기
          </Button>
        </div>
      </section>

      {openGoal && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
          onClick={() => setOpenGoal(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/*모달은 변경 예정*/}
            <GoalModal onClose={() => setOpenGoal(false)} />
          </div>
        </div>
      )}
    </>
  );
}
