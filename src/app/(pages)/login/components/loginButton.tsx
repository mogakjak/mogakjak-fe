import Image from "next/image";
import { LoginButtonProps } from "../_types/login";

export default function LoginButton({ type, onClick }: LoginButtonProps) {
  const config = {
    google: {
      style: " border-gray-200 bg-white ",
      label: "구글 로그인/회원가입",
      icon: "/Icons/google.svg",
    },
    kakao: {
      style: "border-[#FADD0E] bg-[#FADD0E] ",
      label: "카카오 로그인/회원가입",
      icon: "/Icons/kakao.svg",
    },
  }[type];

  return (
    <button
      onClick={onClick}
      className={`bodey1_16M w-[360px] rounded-2xl flex items-center justify-center gap-2 border px-10 py-4 ${config.style}`}
    >
      <Image src={config.icon} alt={type} width={20} height={20} />
      <span>{config.label}</span>
    </button>
  );
}
