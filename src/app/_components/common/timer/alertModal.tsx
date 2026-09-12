"use client";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "todoRequired" | "newHostAck" | "officialLoungeFull";
}

const MODAL_CONTENT = {
  todoRequired: {
    title: "작업을 먼저 설정해 주세요!",
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
  newHostAck: {
    title: (
      <>
        축하합니다!
        <br />
        방장이 되었어요!
      </>
    ),
    description: (
      <>
        이전 방장이 퇴장하여
        <br />
        새로운 방장이 되셨어요!
        <br />
        이제 그룹의 이름을 수정할 수 있습니다.
      </>
    ),
    confirmText: "확인",
  },
  officialLoungeFull: {
    title: "인원이 가득 차 접속할 수 없어요",
    description: (
      <>
        공식 라운지는 최대 20명까지 입장할 수 있어요.
        <br />
        지금 라운지가 열기로 가득 찼으니
        <br />
        잠시 후 다시 시도해 주세요.
      </>
    ),
    confirmText: "확인",
  },
};

export default function AlertModal({ isOpen, onClose, type }: AlertModalProps) {
  if (!isOpen) return null;

  const { title, description, confirmText } = MODAL_CONTENT[type];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-100">
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
