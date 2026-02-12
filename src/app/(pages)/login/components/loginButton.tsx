"use client";

import Image from "next/image";
import { useLogin } from "@/app/_hooks/login/useLogin";
import { sendGAEvent } from "@next/third-parties/google"

type LoginType = "google" | "kakao";

interface LoginButtonProps {
  type: LoginType;
}

export default function LoginButton({ type }: LoginButtonProps) {
  const login = useLogin();

  const handleLogin = () => {
    if (login.isPending) return;
    sendGAEvent("event", "login", {
      loginType: type,
    });
    login.mutate({ provider: type });
  };

  const CONFIG = {
    google: {
      label: "구글 로그인/회원가입",
      icon: "/Icons/google.svg",
      bg: "bg-white",
      text: "text-gray-800",
      border: "border-gray-200",
    },
    kakao: {
      label: "카카오 로그인/회원가입",
      icon: "/Icons/kakao.svg",
      bg: "bg-[#FEE500]",
      text: "text-black",
      border: "border-gray-200",
    },
  } as const;

  const { label, icon, bg, text, border } = CONFIG[type];

  return (
    <button
      onClick={handleLogin}
      disabled={login.isPending}
      aria-label={label}
      className={`w-[360px] h-[56px] rounded-2xl flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-70 ${bg}  ${border} border`}
    >
      <Image src={icon} alt={label} width={20} height={20} />
      <span className={`text-body1-16M ${text}`}>{label}</span>
    </button>
  );
}
