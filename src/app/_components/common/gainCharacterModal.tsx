import Image from "next/image";
import { Button } from "@/components/button";

interface GainCharacterModalProps {
  onClose: () => void;
  name: string;
  level: number;
  imageSrc: string;
  requiredAttendanceDays?: number;
  requiredFocusTimeInSeconds?: number;
}

const formatFocusTime = (seconds?: number) => {
  if (seconds == null) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`;
};

export default function GainCharacterModal({
  onClose,
  name,
  level,
  imageSrc,
  requiredAttendanceDays,
  requiredFocusTimeInSeconds,
}: GainCharacterModalProps) {
  const focusTime = formatFocusTime(requiredFocusTimeInSeconds);

  return (
    <div className="bg-white rounded-[20px] shadow-lg p-5 flex flex-col items-center">
      <button className="flex ml-auto mb-2" onClick={onClose}>
        <Image src="/Icons/xmark.svg" width={24} height={24} alt="닫기" aria-label="닫기" />
      </button>

      <div className="flex flex-col items-center py-4 px-7">
        <p className="text-heading4-20SB mb-2">축하합니다!</p>

        <p className="text-heading3-24SB mb-1">
          <b className="text-red-500">성장 조건</b>을 달성하여
        </p>

        <p className="text-heading3-24SB">
          <b className="text-red-500">Lv.{level} {name}</b>
          을 얻었어요.
        </p>

        <div className="text-caption-12R text-gray-700 mt-7 px-4 py-2 rounded-full border border-gray-200 bg-gray-100 ">
          {requiredAttendanceDays != null && focusTime
            ? `출석 ${requiredAttendanceDays}일 · 몰입 ${focusTime}`
            : "출석과 몰입 조건을 달성했어요!"}
        </div>

        <div className="p-6 flex flex-col items-center gap-2 mb-7">
          <Image src={imageSrc} alt={name} width={140} height={140} />
          <p className="text-body1-16SB">{name}</p>
        </div>

        <p className="text-body1-16R text-gray-500 mb-7">
          수집된 캐릭터는 마이페이지 &gt; 내 과일 바구니에서 확인할 수 있어요
        </p>

        <Button className="w-[200px]" onClick={onClose}>
          보상 받기
        </Button>
      </div>
    </div>
  );
}
