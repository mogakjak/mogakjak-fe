import { getCharacterByHours } from "@/app/_utils/getCharacterByHours";
import { Button } from "@/components/button";
import Image from "next/image";

interface GainCharacterModalProps {
  onClose: () => void;
  hours: number;
}

export default function GainCharacterModal({
  onClose,
  hours,
}: GainCharacterModalProps) {
  const info = getCharacterByHours(hours);
  const imageSrc = `/character/level${info.level}.svg`;
  return (
    <div className="bg-white rounded-[20px] shadow-lg p-5  flex flex-col items-center">
      <button className="flex ml-auto mb-2" onClick={onClose}>
        <Image src="/Icons/xmark.svg" alt="닫기" width={24} height={24} />
      </button>

      <div className="flex flex-col items-center py-4 px-7">
        <p className="text-heading4-20SB mb-2">축하합니다!</p>
        <p className="text-heading3-24SB mb-1">
          <b className="text-red-500">{info.hours}시간</b>을 달성하여
        </p>
        <p className="text-heading3-24SB">
          <b className="text-red-500">
            Lv.{info.level} {info.name}
          </b>
          을 얻었어요.
        </p>

        <div className="text-caption-12R text-gray-700 mt-7 px-4 py-2 rounded-full border border-gray-200 bg-gray-100 ">
          {info.description}
        </div>

        <div className="p-6 flex flex-col items-center gap-2 mb-7">
          <Image src={imageSrc} alt="캐릭터" width={140} height={140}></Image>
          <p className="text-body1-16SB">{info.name}</p>
        </div>
        <p className="text-body1-16R text-gray-500 mb-7">
          수집된 캐릭터는 마이페이지 &gt; 내 채소바구니에서 확인할 수 있어요
        </p>
        <Button className="w-[200px]" leftIcon={null} onClick={onClose}>
          보상 받기
        </Button>
      </div>
    </div>
  );
}
