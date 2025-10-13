import Image from "next/image";
import { LoginButtonProps } from "../_types/login";

export default function LoginButton({ type, onClick }: LoginButtonProps) {
  const config = {
    google: {
      text: "text-black",
      label: "구글 로그인/회원가입",
      icon: "/icons/google.svg",
    },
    kakao: {
      text: "text-black",
      label: "카카오 로그인/회원가입",
      icon: "/icons/kakao.svg",
    },
  }[type];

  return (
    <button
      onClick={onClick}
      className={`w-[360px] flex items-center justify-center gap-2 rounded-lg border px-10 py-4`}
    >
      <Image src={config.icon} alt={type} width={20} height={20} />
      <span>{config.label}</span>
    </button>
  );
}
