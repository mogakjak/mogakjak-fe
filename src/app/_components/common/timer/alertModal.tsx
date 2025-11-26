"use client";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "todoRequired" | "groupTimerLimit"; // 원하는 타입 추가 가능
}

const MODAL_CONTENT = {
  todoRequired: {
    title: "할 일을 먼저 설정해 주세요!",
    description: (
      <>
        어떤 일에 몰입하실 건가요?
        <br />
        상단의 ✏️연필 아이콘을 눌러
        <br />
        오늘 집중할 목표를 설정해 주세요.
      </>
    ),
    confirmText: "확인",
  },
  groupTimerLimit: {
    title: "공통 타이머는 2명부터 시작할 수 있어요",
    description: (
      <>
        메이트가 2명 이상 참여해야 활성화됩니다.
        <br />
        모각작 메이트를 초대하거나, 우측
        <span className="text-red-500 ml-1">개인타이머</span>
        <br />를 이용해 먼저 몰입을 실행해 보세요.
      </>
    ),
    confirmText: "확인",
  },
};

export default function AlertModal({ isOpen, onClose, type }: AlertModalProps) {
  if (!isOpen) return null;

  const { title, description, confirmText } = MODAL_CONTENT[type];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100]">
      <div className="rounded-xl shadow-[0px_0px_28px_rgba(0,0,0,0.15)] inline-flex flex-col overflow-hidden">
        <div className="w-full px-6 pt-8 pb-7 bg-neutral-50 flex flex-col items-center gap-2">
          <div className="text-center text-neutral-900 text-body1-16SB">
            {title}
          </div>

          <div className="text-center text-zinc-600 text-body2-14R leading-5">
            {description}
          </div>
        </div>

        <div className="w-full flex">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 bg-red-500 text-neutral-50 text-base font-semibold hover:bg-red-600 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
