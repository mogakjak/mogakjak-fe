"use client";

export default function KickMemberModal({
  memberName,
  isPending = false,
  onClose,
  onConfirm,
}: {
  memberName: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex flex-col w-[340px]">
      <div className="flex flex-col p-7 pt-8 bg-white rounded-t-xl shadow-md text-center">
        <h2 className="text-body1-16SB">멤버 내보내기</h2>
        <p className="text-body2-14R text-gray-600 mt-2">
          &quot;{memberName}&quot; 님을 그룹에서 내보내시겠어요?
          <br />
          내보낸 멤버는 다시 초대해야 들어올 수 있어요.
        </p>
      </div>

      <div className="flex">
        <button
          onClick={onClose}
          disabled={isPending}
          className="w-full py-3 bg-gray-200 text-gray-600 rounded-bl-xl disabled:opacity-50"
        >
          취소
        </button>
        <button
          className="w-full py-3 bg-red-500 text-white rounded-br-xl disabled:bg-red-300"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? "처리 중..." : "내보내기"}
        </button>
      </div>
    </div>
  );
}
