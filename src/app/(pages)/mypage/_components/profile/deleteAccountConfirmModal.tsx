"use client";

import Image from "next/image";

interface DeleteAccountConfirmModalProps {
  nickname: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export default function DeleteAccountConfirmModal({
  nickname,
  onClose,
  onConfirm,
  isPending = false,
}: DeleteAccountConfirmModalProps) {

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
                  <div className="self-stretch text-center justify-center text-neutral-900 text-2xl font-semibold font-['Pretendard'] leading-8">
                    마지막으로 확인할게요!
                  </div>
                  <div className="self-stretch text-center justify-center text-zinc-500 text-xl font-normal font-['Pretendard'] leading-7">
                    탈퇴한 계정은 재사용 및 복구가 불가능해요.
                    <br />
                    또한, {nickname}님이 수집한 과일 캐릭터와 기록이
                    <br />
                    즉시 삭제되며 복구할 수 없어요.
                  </div>
                </div>
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
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 h-14 px-5 py-3 bg-red-500 flex justify-center items-center gap-1 overflow-hidden hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center justify-start text-neutral-50 text-xl font-semibold font-['Pretendard'] leading-7">
                {isPending ? "처리 중..." : "탈퇴하기"}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

