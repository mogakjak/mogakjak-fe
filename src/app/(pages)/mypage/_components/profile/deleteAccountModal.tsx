"use client";

import { useState } from "react";
import Image from "next/image";

interface DeleteAccountModalProps {
  nickname: string;
  onClose: () => void;
  onNext: (reasons: string[], feedback: string) => void;
}

const LEAVE_REASONS = [
  "더이상 동기부여가 되지 않아요",
  "함께하는 느낌을 받지 못했어요",
  "사용법이 어려웠어요",
  "요즘 너무 바빠서 작업할 시간이 없어요",
  "기타",
];

export default function DeleteAccountModal({
  nickname,
  onClose,
  onNext,
}: DeleteAccountModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");

  const handleReasonToggle = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleNext = () => {
    onClose();
    onNext(selectedReasons, feedback);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        className="w-[516px] rounded-[20px] shadow-[0px_0px_28px_0px_rgba(0,0,0,0.15)] inline-flex flex-col justify-start items-start overflow-hidden bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="self-stretch p-5 bg-neutral-50 shadow-[0px_0px_28px_0px_rgba(0,0,0,0.15)] inline-flex justify-start items-center gap-2.5">
          <div className="w-[476px] inline-flex flex-col justify-start items-end gap-2">
            <button
              onClick={onClose}
              className="w-6 h-6 relative overflow-hidden cursor-pointer"
            >
              <Image
                src="/Icons/cancel.svg"
                alt="닫기"
                width={24}
                height={24}
              />
            </button>
            <div className="self-stretch py-5 flex flex-col justify-start items-center gap-5">
              <div className="self-stretch flex flex-col justify-start items-center gap-8">
                <div className="w-96 flex flex-col justify-start items-center gap-3">
                  <div className="self-stretch text-center justify-center">
                    <span className="text-neutral-900 text-2xl font-semibold font-['Pretendard'] leading-8">
                      정말{" "}
                    </span>
                    <span className="text-red-500 text-2xl font-semibold font-['Pretendard'] leading-8">
                      토실뽀모
                    </span>
                    <span className="text-neutral-900 text-2xl font-semibold font-['Pretendard'] leading-8">
                      를 두고 떠나시나요?
                    </span>
                  </div>
                  <div className="self-stretch text-center justify-center text-zinc-500 text-xl font-normal font-['Pretendard'] leading-7">
                    탈퇴한 계정은 재사용 및 복구가 불가능해요.
                    <br />
                    또한, {nickname}님이 수집한 과일 캐릭터와 기록이
                    <br />
                    즉시 삭제되며 복구할 수 없어요.
                  </div>
                </div>
                <div className="w-96 h-0 outline-1 -outline-offset-[0.50px] outline-gray-200"></div>
              </div>
              <div className="flex flex-col justify-start items-center gap-5">
                <div className="w-96 flex flex-col justify-start items-center gap-4">
                  <div className="self-stretch h-6 text-center justify-center text-zinc-600 text-base font-normal font-['Pretendard'] leading-6">
                    떠나시는 이유를 알려주세요 (중복 선택 가능)
                  </div>
                  <div className="w-72 flex flex-col justify-start items-center gap-2">
                    {LEAVE_REASONS.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => handleReasonToggle(reason)}
                        className={`px-3 py-1 rounded-[80px] outline-1 -outline-offset-1px inline-flex justify-center items-center gap-2 overflow-hidden transition-colors ${
                          selectedReasons.includes(reason)
                            ? "bg-red-500 outline-red-500"
                            : "bg-gray-100 outline-gray-200"
                        }`}
                      >
                        <div
                          className={`text-center justify-start text-sm font-normal font-['Pretendard'] leading-5 ${
                            selectedReasons.includes(reason)
                              ? "text-white"
                              : "text-gray-400"
                          }`}
                        >
                          {reason}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="모각작이 더 좋은 서비스가 될 수 있도록 의견을 공유해 주세요"
                  className="w-96 h-28 px-5 py-3 bg-neutral-50 rounded-lg outline-1 -outline-offset-1 outline-gray-200 inline-flex justify-start items-start gap-2 resize-none text-zinc-500 text-sm font-normal font-['Pretendard'] leading-5"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch inline-flex justify-center items-start">
          <div className="flex-1 flex justify-between items-center">
            <button
              onClick={onClose}
              className="flex-1 h-14 px-5 py-3 bg-gray-200 flex justify-center items-center gap-1 overflow-hidden hover:bg-gray-300 transition-colors"
            >
              <div className="text-center justify-start text-zinc-600 text-xl font-semibold font-['Pretendard'] leading-7">
                취소하기
              </div>
            </button>
            <button
              onClick={handleNext}
              className="flex-1 h-14 px-5 py-3 bg-red-500 flex justify-center items-center gap-1 overflow-hidden hover:bg-red-600 transition-colors"
            >
              <div className="text-center justify-start text-neutral-50 text-xl font-semibold font-['Pretendard'] leading-7">
                다음 단계로
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

