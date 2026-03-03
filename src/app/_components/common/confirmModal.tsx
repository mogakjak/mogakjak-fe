"use client";

import { createPortal } from "react-dom";
import Image from "next/image";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({
  open,
  title,
  confirmText = "삭제하기",
  cancelText = "취소",
  isPending = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-[393px] rounded-[20px] shadow-[0px_0px_28px_0px_rgba(0,0,0,0.15)] inline-flex flex-col justify-start items-start overflow-hidden bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="self-stretch p-5 bg-neutral-50 shadow-[0px_0px_28px_0px_rgba(0,0,0,0.15)] inline-flex justify-start items-center gap-2.5">
          <div className="w-[476px] inline-flex flex-col justify-start items-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 relative overflow-hidden cursor-pointer"
              aria-label="닫기"
            >
              <Image
                src="/Icons/cancel.svg"
                alt="닫기"
                width={24}
                height={24}
              />
            </button>
            <div className="self-stretch py-5 flex justify-center items-center font-semibold text-2xl">
              <p className="text-red-500 truncate max-w-[100px]">{title}</p>
              <p>을 삭제하시겠어요?</p>
            </div>
          </div>
        </div>

        <div className="self-stretch inline-flex justify-center items-start">
          <div className="flex-1 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-14 px-5 py-3 bg-gray-200 flex justify-center items-center gap-1 overflow-hidden hover:bg-gray-300 transition-colors"
              disabled={isPending}
            >
              <div className="text-center text-gray-600 text-body1-16SB font-semibold leading-7">
                {cancelText}
              </div>
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 h-14 px-5 py-3 bg-red-500 flex justify-center items-center gap-1 overflow-hidden hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center text-neutral-50 text-body1-16SB font-semibold leading-7">
                {isPending ? "처리 중..." : confirmText}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
