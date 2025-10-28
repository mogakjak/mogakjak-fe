import Image from "next/image";

interface ProfileActiveProps {
  src?: string;
  name: string;
  active: boolean;
  className?: string; // ✅ 외부 스타일 추가
}

export default function ProfileActive({
  src,
  name,
  active,
  className = "w-[60px] h-[60px]",
}: ProfileActiveProps) {
  const imageSrc = src || "/Icons/defaultImage.svg";

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-full bg-gray-100 border border-gray-200 overflow-hidden z-0">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover"
          sizes="60px"
        />
      </div>

      <div
        className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white z-10 ${
          active ? "bg-green-600" : "bg-gray-400"
        }`}
      />
    </div>
  );
}
