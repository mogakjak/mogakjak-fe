import Image from "next/image";

interface CharacterProps {
  name: string;
  locked?: boolean; // 잠금 여부
}

export default function Character({ name, locked = false }: CharacterProps) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-2 rounded-lg px-8 py-5.5 bg-gray-100 border border-gray-200 overflow-hidden">
      <Image
        src={`/character/${name}.svg`}
        alt={`${name} 캐릭터`}
        width={120}
        height={120}
        className={"object-contain transition-all duration-300 pt-3.5 pb-2.5"}
      />

      <p className={"text-body1-16SB transition-colors duration-300 "}>
        {name}
      </p>

      {locked && (
        <>
          <div className="absolute inset-0 bg-gray-200/60 z-10"></div>
          <Image
            src="/Icons/lock.svg"
            alt="잠김"
            width={48}
            height={48}
            className="absolute top-3 left-3 z-20 opacity-90"
          />
        </>
      )}
    </div>
  );
}
