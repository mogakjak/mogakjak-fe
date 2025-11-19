"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import clsx from "clsx";

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (targetSeconds: number) => void;
}

export default function TimerModal({
  isOpen,
  onClose,
  onStart,
}: TimerModalProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const formatTime = (value: number) => {
    return String(value).padStart(2, "0");
  };

  const updateTime = useCallback(
    (h: number, m: number, s: number) => {
      const newHours = Math.max(0, Math.min(99, h));
      const newMinutes = Math.max(0, Math.min(59, m));
      const newSeconds = Math.max(0, Math.min(59, s));
      setHours(newHours);
      setMinutes(newMinutes);
      setSeconds(newSeconds);
    },
    []
  );

  const handleStart = useCallback(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds > 0) {
      onStart(totalSeconds);
      onClose();
    }
  }, [hours, minutes, seconds, onStart, onClose]);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const isDisabled = totalSeconds === 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-100">
      <div className="w-96 p-5 bg-neutral-50 rounded-[20px] shadow-[0px_0px_28px_0px_rgba(0,0,0,0.15)] inline-flex flex-col justify-start items-end gap-2 overflow-hidden">
        <button
          onClick={onClose}
          className="w-6 h-6 relative overflow-hidden flex items-center justify-center"
        >
          <Image
            src="/Icons/xmark.svg"
            alt="close"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </button>

        <div className="self-stretch p-5 flex flex-col justify-start items-center gap-7">
          <div className="self-stretch flex flex-col justify-start items-center gap-1">
            <div className="inline-flex justify-start items-center gap-1">
              <Image
                src="/Icons/timerRed.svg"
                alt="timer"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="text-center justify-center text-red-500 text-base font-semibold font-['Pretendard'] leading-6">
                타이머
              </div>
            </div>
            <div className="self-stretch text-center justify-center text-neutral-900 text-xl font-semibold font-['Pretendard'] leading-7">
              몰입할 시간을 설정해 보세요!
            </div>
            <div className="self-stretch text-center justify-center text-zinc-600 text-sm font-normal font-['Pretendard'] leading-5">
              시간이 종료되면 알림 메시지가 표시됩니다.
            </div>
          </div>

          <div className="self-stretch px-10 py-5 bg-gray-100 rounded-xl outline-1 -outline-offset-1 outline-gray-200 inline-flex justify-center items-center gap-2 overflow-hidden">
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formatTime(hours)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  const num = val === '' ? 0 : Math.min(99, parseInt(val, 10));
                  updateTime(num, minutes, seconds);
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    updateTime(0, minutes, seconds);
                  }
                }}
                className="w-12 bg-transparent text-center text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500 outline-none"
              />
              <span className="text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500">:</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formatTime(minutes)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  const num = val === '' ? 0 : Math.min(59, parseInt(val, 10));
                  updateTime(hours, num, seconds);
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    updateTime(hours, 0, seconds);
                  }
                }}
                className="w-12 bg-transparent text-center text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500 outline-none"
              />
              <span className="text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500">:</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formatTime(seconds)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  const num = val === '' ? 0 : Math.min(59, parseInt(val, 10));
                  updateTime(hours, minutes, num);
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    updateTime(hours, minutes, 0);
                  }
                }}
                className="w-12 bg-transparent text-center text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={isDisabled}
            className={clsx(
              "w-48 h-12 px-6 py-3 rounded-2xl inline-flex justify-center items-center gap-2 overflow-hidden",
              isDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            )}
          >
            <div className="justify-start text-base font-semibold font-['Pretendard'] leading-6">
              타이머 시작하기
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

