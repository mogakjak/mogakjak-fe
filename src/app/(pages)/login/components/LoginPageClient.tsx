"use client";

import { useEffect } from "react";
import Image from "next/image";
import LoginButton from "./loginButton";
import { invalidateTokenCache } from "@/app/api/auth/api";
import { sendGAEvent } from "@next/third-parties/google"; // [추가]

export default function LoginPageClient() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      sendGAEvent("event", "page_back_navigation", {
        from_page: "/login",
      });
    };
    window.addEventListener("popstate", handlePopState);

    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.substring(1));
    const code = hashParams.get("code");

    if (code === "WITHDRAWN_USER") {
      sendGAEvent("event", "withdrawn_user_arrival", {
        source: "hash_code",
      });

      invalidateTokenCache();
      fetch("/api/auth/logout", {
        method: "POST",
      }).catch(() => { });
      window.history.replaceState(null, "", "/login");
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <Image
        src="/Icons/logoSlogan.svg"
        alt="slogan"
        width={257}
        height={224}
        priority
      />
      <p className="text-body1-16R mt-5 text-gray-600">
        함께 몰입하며 꾸준함을 만드는 힘을 경험해 보세요!
      </p>

      <div className="mt-20 gap-4 flex flex-col">
        <LoginButton type="google" />
        <LoginButton type="kakao" />
      </div>
    </div>
  );
}