"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import clsx from "clsx";

type TimeInput = {
  hours: number;
  minutes: number;
  seconds: number;
};

type PomodoroModalProps = {
  open: boolean;
  onClose: () => void;
  onStart: (focusSeconds: number, breakSeconds: number, repeatCount: number) => void;
};

const MAX_SECONDS = 59 * 60 + 59; // 59분 59초

function timeToSeconds(time: TimeInput): number {
  return time.hours * 3600 + time.minutes * 60 + time.seconds;
}

function secondsToTime(seconds: number): TimeInput {
  const total = Math.min(seconds, MAX_SECONDS);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return { hours, minutes, seconds: secs };
}


export default function PomodoroModal({
  open,
  onClose,
  onStart,
}: PomodoroModalProps) {
  const [focusTime, setFocusTime] = useState<TimeInput>({ hours: 0, minutes: 20, seconds: 0 });
  const [breakTime, setBreakTime] = useState<TimeInput>({ hours: 0, minutes: 10, seconds: 0 });
  const [repeatCount, setRepeatCount] = useState(1);

  const updateTime = useCallback(
    (setter: React.Dispatch<React.SetStateAction<TimeInput>>, h: number, m: number, s: number) => {
      setter(() => {
        const newTime = {
          hours: Math.max(0, Math.min(59, h)),
          minutes: Math.max(0, Math.min(59, m)),
          seconds: Math.max(0, Math.min(59, s)),
        };
        const total = timeToSeconds(newTime);
        if (total > MAX_SECONDS) {
          return secondsToTime(MAX_SECONDS);
        }
        return newTime;
      });
    },
    []
  );

  const handleStart = () => {
    const focusSeconds = timeToSeconds(focusTime);
    const breakSeconds = timeToSeconds(breakTime);
    if (focusSeconds > 0 && breakSeconds > 0 && repeatCount > 0) {
      onStart(focusSeconds, breakSeconds, repeatCount);
      onClose();
    }
  };

  const isValid = timeToSeconds(focusTime) > 0 && timeToSeconds(breakTime) > 0 && repeatCount > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <button
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="닫기 오버레이"
      />
      <div className="relative w-110 p-5 bg-neutral-50 rounded-[20px] shadow-[0px_0px_28px_0px_rgba(0,0,0,0.15)] inline-flex flex-col justify-start items-end gap-2 overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="w-6 h-6 relative overflow-hidden"
        >
          <Image src="/Icons/xmark.svg" alt="닫기" width={24} height={24} />
        </button>

        <div className="self-stretch p-5 flex flex-col justify-start items-center gap-7">
          <div className="self-stretch flex flex-col justify-start items-center gap-1">
            <div className="inline-flex justify-start items-center gap-1">
              <div className="w-6 h-6 relative overflow-hidden">
                <Image src="/Icons/pomodoroRed.svg" alt="뽀모도로" width={24} height={24} />
              </div>
              <div className="text-center justify-center text-red-500 text-base font-semibold font-['Pretendard'] leading-6">
                뽀모도로
              </div>
            </div>
            <div className="self-stretch text-center justify-center text-neutral-900 text-xl font-semibold font-['Pretendard'] leading-7">
              몰입할 시간을 설정해 보세요!
            </div>
            <div className="self-stretch text-center justify-center text-zinc-600 text-sm font-normal font-['Pretendard'] leading-5">
              뽀모도로란 집중과 짧은 휴식을 반복하는 시간 관리 기법이에요.
              <br />
              각 세션이 종료될 때마다 알림 메시지가 표시됩니다.
            </div>
          </div>

          <div className="flex flex-col justify-start items-start gap-5">
            <div className="w-96 flex flex-col justify-start items-start gap-3">
              <div className="self-stretch justify-center text-neutral-900 text-base font-semibold font-['Pretendard'] leading-6">
                집중 시간
              </div>
              <div className="self-stretch px-10 py-5 bg-gray-100 rounded-xl outline-1 -outline-offset-1 outline-gray-200 inline-flex justify-center items-center gap-2 overflow-hidden w-full">
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={focusTime.hours}
                    onChange={(e) =>
                      updateTime(
                        setFocusTime,
                        Number(e.target.value) || 0,
                        focusTime.minutes,
                        focusTime.seconds
                      )
                    }
                    className="w-12 bg-transparent text-center text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500 outline-none"
                  />
                  <span className="text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={focusTime.minutes}
                    onChange={(e) =>
                      updateTime(
                        setFocusTime,
                        focusTime.hours,
                        Number(e.target.value) || 0,
                        focusTime.seconds
                      )
                    }
                    className="w-12 bg-transparent text-center text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500 outline-none"
                  />
                  <span className="text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={focusTime.seconds}
                    onChange={(e) =>
                      updateTime(
                        setFocusTime,
                        focusTime.hours,
                        focusTime.minutes,
                        Number(e.target.value) || 0
                      )
                    }
                    className="w-12 bg-transparent text-center text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="w-96 flex flex-col justify-start items-start gap-3">
              <div className="self-stretch justify-center text-neutral-900 text-base font-semibold font-['Pretendard'] leading-6">
                휴식 시간
              </div>
              <div className="self-stretch px-10 py-5 bg-gray-100 rounded-xl outline-1 -outline-offset-1 outline-gray-200 inline-flex justify-center items-center gap-2 overflow-hidden w-full">
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={breakTime.hours}
                    onChange={(e) =>
                      updateTime(
                        setBreakTime,
                        Number(e.target.value) || 0,
                        breakTime.minutes,
                        breakTime.seconds
                      )
                    }
                    className="w-12 bg-transparent text-center text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500 outline-none"
                  />
                  <span className="text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={breakTime.minutes}
                    onChange={(e) =>
                      updateTime(
                        setBreakTime,
                        breakTime.hours,
                        Number(e.target.value) || 0,
                        breakTime.seconds
                      )
                    }
                    className="w-12 bg-transparent text-center text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500 outline-none"
                  />
                  <span className="text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={breakTime.seconds}
                    onChange={(e) =>
                      updateTime(
                        setBreakTime,
                        breakTime.hours,
                        breakTime.minutes,
                        Number(e.target.value) || 0
                      )
                    }
                    className="w-12 bg-transparent text-center text-xl font-semibold font-['Pretendard'] leading-7 text-zinc-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="w-96 flex flex-col justify-start items-start gap-3">
              <div className="self-stretch justify-center text-neutral-900 text-base font-semibold font-['Pretendard'] leading-6">
                반복 횟수
              </div>
              <div className="self-stretch h-12 p-3 bg-gray-100 rounded-lg outline-1 -outline-offset-1 outline-gray-200 inline-flex justify-center items-center gap-2">
                <div className="flex-1 inline-flex flex-col justify-center items-center gap-2.5">
                  <div className="self-stretch text-center justify-start text-neutral-700 text-base font-semibold font-['Pretendard'] leading-6">
                    {repeatCount}
                  </div>
                </div>
                <div className="w-5 inline-flex flex-col justify-start items-start gap-0.5">
                  <button
                    type="button"
                    onClick={() => setRepeatCount((prev) => Math.min(99, prev + 1))}
                    className="w-4 h-4 relative overflow-hidden flex items-center justify-center"
                    aria-label="증가"
                  >
                    <Image 
                      src="/Icons/arrow.svg" 
                      alt="증가" 
                      width={16} 
                      height={16}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRepeatCount((prev) => Math.max(1, prev - 1))}
                    className="w-4 h-4 relative overflow-hidden flex items-center justify-center"
                    aria-label="감소"
                  >
                    <Image 
                      src="/Icons/arrow.svg" 
                      alt="감소" 
                      width={16} 
                      height={16}
                      className="rotate-180"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStart}
            disabled={!isValid}
            className={clsx(
              "w-48 h-12 px-6 py-3 rounded-2xl inline-flex justify-center items-center gap-2 overflow-hidden",
              isValid
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
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
