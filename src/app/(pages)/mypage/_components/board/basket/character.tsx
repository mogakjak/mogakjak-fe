import Image from "next/image";

interface CharacterProps {
  hours: number;
  level: number;
  name: string;
  description: string;
  locked?: boolean;
}

export default function Character({
  hours,
  level,
  name,
  description,
  locked = false,
}: CharacterProps) {
  return (
    <div className="h-[238px] flex flex-col items-center justify-center gap-2 rounded-lg p-6 bg-gray-100 border border-gray-200 overflow-hidden">
      {!locked ? (
        <>
          <p className="text-body1-16SB">{`Lv.${level} ${name}`}</p>
          <Image
            src={`/character/level${level}.svg`}
            alt={`${name} 캐릭터`}
            width={120}
            height={120}
            className="object-contain"
          />
          <p className="text-caption-12R text-gray-600 text-center">
            {description}
          </p>
        </>
      ) : (
        <div className="flex flex-col gap-3 items-center justify-center py-2">
          <Image
            src="/Icons/lock.svg"
            alt="잠김"
            width={48}
            height={48}
            className="object-contain opacity-80"
          />
          <p className="text-body1-16SB text-gray-400 text-center">
            {hours}시간 달성 후에 만나요!
          </p>
        </div>
      )}
    </div>
  );
}
