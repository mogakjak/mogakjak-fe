import Image from "next/image";

interface ProfileActiveProps {
  src?: string;
  name: string;
  active: boolean;
  size?: "md" | "sm";
  className?: string;
}

export default function ProfileActive({
  src,
  name,
  active,
  size = "md",
  className = "",
}: ProfileActiveProps) {
  const imageSrc = src || "/Icons/defaultImage.svg";

  const sizeClass = {
    md: "w-[60px] h-[60px]",
    sm: "w-[48px] h-[48px]",
  };

  const dotSizeClass = {
    md: "w-5 h-5",
    sm: "w-4 h-4",
  };

  return (
    <div className={`relative ${sizeClass[size]} ${className}`}>
      <div className="absolute inset-0 rounded-full bg-gray-100 border border-gray-200 overflow-hidden z-0">
        <Image src={imageSrc} alt={name} fill className="object-cover" />
      </div>

      <div
        className={`absolute bottom-0 right-0 rounded-full border-2 border-white z-5 ${
          dotSizeClass[size]
        } ${active ? "bg-green-600" : "bg-gray-400"}`}
      />
    </div>
  );
}
