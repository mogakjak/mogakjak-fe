import Image from "next/image";
import { Button } from "@/components/button";
import { getCharacterByLevel } from "@/app/_utils/getCharacterByHours";

interface GainCharacterModalProps {
  onClose: () => void;
  level: number;
  imageSrc: string;
}

export default function GainCharacterModal({
  onClose,
  level,
  imageSrc,
}: GainCharacterModalProps) {

  const matched = getCharacterByLevel(level);

  const name = matched?.name ?? "캐릭터";
  const hours = matched?.hours ?? 0;
  const description = matched?.description ?? "집중하여 캐릭터를 획득했어요!";

  return (
    <div className="bg-white rounded-[20px] shadow-lg p-5 flex flex-col items-center">
      <button className="flex ml-auto mb-2" onClick={onClose}>
        <Image src="/Icons/xmark.svg" width={24} height={24} alt="닫기" />
      </button>

      <div className="flex flex-col items-center py-4 px-7">
        <p className="text-heading4-20SB mb-2">축하합니다!</p>

        <p className="text-heading3-24SB mb-1">
          <b className="text-red-500">{hours}시간</b>을 달성하여
        </p>

        <p className="text-heading3-24SB">
          <b className="text-red-500">Lv.{level} {name}</b>
          을 얻었어요.
        </p>

        <div className="text-caption-12R text-gray-700 mt-7 px-4 py-2 rounded-full border bg-gray-100 whitespace-pre-line">
          {description}
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
