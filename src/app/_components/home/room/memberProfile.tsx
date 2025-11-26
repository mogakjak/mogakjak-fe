import Image from "next/image";

interface MemberProfileProps {
  isActive: boolean;
  size?: "default" | "small";
  profileUrl?: string;
}

export default function MemberProfile({
  isActive,
  size = "default",
  profileUrl,
}: MemberProfileProps) {
  const sizeClass =
    size === "small" ? "w-7 h-7 text-[12px]" : "w-9 h-9 text-[14px]";

  return (
    <div
      className={`relative ${sizeClass} rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-gray-700 font-semibold`}
    >
      {profileUrl ? (
        <Image
          src={profileUrl}
          alt="프로필"
          width={size === "small" ? 28 : 36}
          height={size === "small" ? 28 : 36}
          className="w-full h-full object-cover"
          style={{ aspectRatio: "1 / 1" }}
        />
      ) : null}
      {!isActive && (
        <div className="absolute inset-0 bg-gray-500/60 rounded-full" />
      )}
    </div>
  );
}
