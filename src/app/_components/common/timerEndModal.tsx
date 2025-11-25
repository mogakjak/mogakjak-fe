export default function TimerEndModal({ 
  onClose, 
  onConfirm 
}: { 
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex flex-col w-[340px]">
      <div className="flex flex-col p-7 pt-8 bg-white rounded-t-xl shadow-md text-center">
        <h2 className="text-body1-16SB">
          타이머를 종료하고 <br />
          이동하시겠어요?
        </h2>

        <p className="text-body2-14R text-gray-600 mt-2">
          현재 기록된 시간이 총 누적 시간에 합산됩니다. 계속 진행하시겠어요?
        </p>
      </div>

      <div className="flex">
        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-200 text-gray-600 rounded-bl-xl"
        >
          취소
        </button>
        <button
          className="w-full py-3 bg-red-500 text-white rounded-br-xl disabled:bg-red-300"
          onClick={onConfirm}
        >
          종료 및 초기화
        </button>
      </div>
    </div>
  );
}
