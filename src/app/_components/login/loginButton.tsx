import Image from "next/image";
import { LoginButtonProps } from "./_types/login";

export default function LoginButton({ type, onClick }: LoginButtonProps) {
  const config = {
    google: {
      text: "text-gray-700",
      label: "Google로 로그인",
      icon: "/icons/google.svg",
    },
    kakao: {
      text: "text-[#3C1E1E]",
      label: "카카오로 로그인",
      icon: "/icons/kakao.svg",
    },
  }[type];

  return (
    <button
      onClick={onClick}
      className={` flex items-center justify-center gap-2 rounded-lg border p-3 w-full`}
    >
      <Image src={config.icon} alt={type} width={20} height={20} />
      <span>{config.label}</span>
    </button>
  );
}
