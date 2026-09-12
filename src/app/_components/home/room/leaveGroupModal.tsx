export default function LeaveGroupModal({
  groupName,
  isHost = false,
  onClose,
  onConfirm,
}: {
  groupName: string;
  isHost?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex flex-col w-[340px]">
      <div className="flex flex-col p-7 pt-8 bg-white rounded-t-xl shadow-md text-center">
        <h2 className="text-body1-16SB">
          {isHost ? "방장은 그룹을 나갈 수 없어요" : "그룹 나가기"}
        </h2>

        <p className="text-body2-14R text-gray-600 mt-2">
          {isHost ? (
            <>
              다른 멤버가 있는 동안에는 나갈 수 없습니다.
              <br />
              멤버를 모두 내보낸 뒤 다시 시도해 주세요.
            </>
          ) : (
            <>
              &quot;{groupName}&quot; 그룹을 나가시겠습니까? <br />
              진행 중인 기록이 중단될 수 있습니다.
            </>
          )}
        </p>
      </div>

      <div className="flex">
        <button
          onClick={onClose}
          className={`w-full py-3 bg-gray-200 text-gray-600 ${
            isHost ? "rounded-b-xl" : "rounded-bl-xl"
          }`}
        >
          {isHost ? "확인" : "취소"}
        </button>
        {!isHost && (
          <button
            className="w-full py-3 bg-red-500 text-white rounded-br-xl disabled:bg-red-300"
            onClick={onConfirm}
          >
            확인 및 나가기
          </button>
        )}
      </div>
    </div>
  );
}
