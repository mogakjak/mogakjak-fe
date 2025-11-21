"use client";

interface TodoRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TodoRequiredModal({
  isOpen,
  onClose,
}: TodoRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-100">
      <div className="rounded-xl shadow-[0px_0px_28px_0px_rgba(0,0,0,0.15)] inline-flex flex-col justify-start items-center overflow-hidden">
        <div className="w-72 px-7 pt-8 pb-7 bg-neutral-50 flex flex-col justify-start items-center gap-2 overflow-hidden">
          <div className="self-stretch text-center justify-start text-neutral-900 text-base font-semibold font-['Pretendard'] leading-6">
            할 일을 먼저 설정해 주세요!
          </div>
          <div className="self-stretch text-center justify-start text-zinc-600 text-sm font-normal font-['Pretendard'] leading-5">
            어떤 일에 몰입하실 건가요?
            <br />
            상단의 ✏️연필 아이콘을 눌러
            <br />
            오늘 집중할 목표를 설정해 주세요.
          </div>
        </div>
        <div className="self-stretch inline-flex justify-center items-start">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 bg-red-500 flex justify-center items-center gap-1 overflow-hidden hover:bg-red-600 transition-colors"
          >
            <div className="text-center justify-start text-neutral-50 text-base font-semibold font-['Pretendard'] leading-6">
              확인
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

