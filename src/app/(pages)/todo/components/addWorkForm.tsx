"use client";

import {  useState } from "react";
import Image from "next/image";
import CategorySelect, {
  type CategoryOption,
} from "./categorySelect";
import WorkTitleField from "./workTitleField";
import DateField from "./dateField";
import DurationField from "./durationField";
import clsx from "clsx";

export type AddWorkPayload = {
  categoryId: string;
  title: string;
  date: Date;
  targetSeconds: number;
};

export default function AddWorkForm({
  categories,
  defaultDate = new Date(),
  onSubmit,
  onClose,
  className,
}: {
  categories: CategoryOption[];
  defaultDate?: Date;
  onSubmit?: (payload: AddWorkPayload) => void;
  onClose?: () => void;
  className?: string;
}) {
  const [categoryId, setCategoryId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(defaultDate);
  const [target, setTarget] = useState<number>(0);

  const isValid =
    categoryId && title.trim().length > 0 && target >= 60 && target <= 86400;

  return (
    <div
      className={clsx(
        "w-[516px] p-5 bg-neutral-50 rounded-[20px] shadow-[0_0_20px_0_rgba(0,0,0,0.15)] inline-flex flex-col items-end gap-2",
        className,
      )}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="w-6 h-6"
      >
        <Image
          src="/Icons/cancel.svg"
          alt="닫기"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      </button>

      <div className="self-stretch p-5 flex flex-col items-center gap-7">
        <div className="self-stretch text-center text-neutral-900 text-xl font-semibold leading-7">
          할 일을  등록해 보세요!
        </div>

        <div className="self-stretch flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="text-neutral-900 text-base font-semibold leading-snug">
              카테고리
            </div>
            <CategorySelect
              value={categoryId || null}
              options={categories}
              onChange={setCategoryId}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-neutral-900 text-base font-semibold leading-snug">
              할 일
            </div>
            <WorkTitleField value={title} onChange={setTitle} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-neutral-900 text-base font-semibold leading-snug">
              날짜
            </div>
            <DateField value={date} onChange={setDate} />
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-neutral-900 text-base font-semibold leading-snug">
              목표 달성 시간
            </div>
            <div className="text-zinc-600 text-sm leading-tight">
              언제든 수정 가능하니 부담없이 설정해 보세요
            </div>
            <DurationField seconds={target} onChange={setTarget} />
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            isValid &&
            onSubmit?.({ categoryId, title: title.trim(), date, targetSeconds: target })
          }
          disabled={!isValid}
          className={clsx(
            "w-40 h-12 px-6 py-3 rounded-2xl inline-flex justify-center items-center",
            isValid ? "bg-red-500 text-neutral-50" : "bg-gray-200 text-gray-400",
          )}
        >
          할 일 추가
        </button>
      </div>
    </div>
  );
}
