"use client";

import Image from "next/image";
import { useLogin } from "@/app/_api/auth/useLogin";

type LoginType = "google" | "kakao";

interface LoginButtonProps {
  type: LoginType;
}

export default function LoginButton({ type }: LoginButtonProps) {
  const login = useLogin();

  const handleLogin = () => {
    if (login.isPending) return;
    login.mutate({ provider: type });
  };

  const CONFIG = {
    google: {
      label: "구글로 계속하기",
      icon: "/Icons/google.svg",
      bg: "bg-white",
      hover: "hover:bg-gray-50",
      text: "text-gray-800",
      border: "border-gray-200",
    },
    kakao: {
      label: "카카오로 계속하기",
      icon: "/Icons/kakao.svg",
      bg: "bg-[#FEE500]",
      hover: "hover:brightness-95",
      text: "text-black",
      border: "border-gray-200",
    },
  } as const;

  const { label, icon, bg, hover, text, border } = CONFIG[type];

  return (
    <button
      onClick={handleLogin}
      disabled={login.isPending}
      className={`w-72 h-12 rounded-lg flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-70 ${bg} ${hover} ${border} border`}
    >
      <Image src={icon} alt={label} width={20} height={20} />
      <span className={`text-body1-16M ${text}`}>{label}</span>
    </button>
  );
}
