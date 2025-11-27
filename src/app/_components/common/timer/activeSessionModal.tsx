export default function ActiveSessionModal({
    onClose,
    onConfirm
}: {
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="flex flex-col w-[340px]">
            <div className="flex flex-col p-7 pt-8 bg-white rounded-t-xl text-center">
                <h2 className="text-body1-16SB">
                    이미 실행 중인 타이머가 있습니다
                </h2>

                <p className="text-body2-14R text-gray-600 mt-2">
                    기존 타이머를 종료하고 <br /> 새로 시작하시겠어요?
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
                    종료 및 시작
                </button>
            </div>
        </div>
    );
}
