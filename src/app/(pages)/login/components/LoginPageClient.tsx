"use client";

import { useEffect } from "react";
import Image from "next/image";
import LoginButton from "./loginButton";
import { invalidateTokenCache } from "@/app/api/auth/api";

export default function LoginPageClient() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.substring(1));
    const code = hashParams.get("code");

    if (code === "WITHDRAWN_USER") {
      invalidateTokenCache();
      fetch("/api/auth/logout", {
        method: "POST",
      }).catch(() => {
      });
      window.history.replaceState(null, "", "/login");
    }
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <Image
        src="/Icons/logoSlogan.svg"
        alt="slogan"
        width={257}
        height={224}
      ></Image>
      <p className="text-body1-16R mt-5 text-gray-600">
        함께 몰입하며 꾸준함을 만드는 힘을 경험해 보세요!
      </p>

      <div className="mt-20 gap-4 flex flex-col">
        <LoginButton type="google"></LoginButton>
        <LoginButton type="kakao"></LoginButton>
      </div>
    </div>
  );
}

