"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import LoginButton from "./loginButton";
import { invalidateTokenCache } from "@/app/api/auth/api";
import { sendGAEvent } from "@next/third-parties/google"; // [추가]

export default function LoginPageClient() {
  const focusSectionRef = useRef<HTMLDivElement | null>(null);
  const landingSections = [
    "/landing/landing1.jpg",
    "/landing/landing2.jpg",
    "/landing/landing3.jpg",
    "/landing/landing4.jpg",
    "/landing/landing5.jpg",
    "/landing/landing6.jpg",
  ];

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
      invalidateTokenCache();
      fetch("/api/auth/logout", {
        method: "POST",
      }).catch(() => { });
      window.history.replaceState(null, "", "/login");
    }

    const searchParams = new URLSearchParams(window.location.search);
    const inviteGroupId = searchParams.get("invite");
    if (inviteGroupId) {
      import("@/app/_lib/pendingInvite").then((mod) => {
        mod.setPendingInviteGroupId(inviteGroupId);
        window.history.replaceState(null, "", "/login");
      });
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleStartClick = () => {
    focusSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="relative left-1/2 right-1/2 -mx-[50vw] w-screen h-16 px-9 py-2 bg-neutral-50 border-b border-gray-200 flex justify-between items-center overflow-hidden">
        <div className="w-28 h-9 relative">
          <Image
            src="/logo.svg"
            alt="mogakjak logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <button
          type="button"
          onClick={handleStartClick}
          className="w-36 h-11 px-6 py-5 bg-red-500 rounded-xl flex justify-center items-center gap-2.5 overflow-hidden"
        >
          <span className="text-neutral-50 text-base font-semibold font-['Pretendard'] leading-6">
            시작하기
          </span>
        </button>
      </header>

      <main className="relative left-1/2 -translate-x-1/2 w-screen max-w-none flex flex-col items-center bg-[url('/landing/landing.png')] bg-cover bg-top bg-no-repeat py-20">
        <div className="w-[906px] max-w-full px-4 inline-flex flex-col justify-start items-center gap-24">
          <div className="flex flex-col justify-start items-center gap-11">
            <div className="flex flex-col justify-start items-center gap-6">
              <div className="text-center justify-start text-neutral-900 text-6xl font-semibold font-['Pretendard'] leading-[76.80px]">
                몰입이 즐거워지는
                <br />
                가장 쉬운 방법
              </div>
              <div className="text-center justify-center text-zinc-600 text-xl font-normal font-['Pretendard'] leading-7">
                혼자는 아니지만, 같이라는 부담은 덜어냈어요.
                <br />
                친구들과 함께하는 것이 당신의 성실함을 자연스럽게 이끌어줄
                거예요.
              </div>
            </div>
            <button
              type="button"
              onClick={handleStartClick}
              className="h-11 px-6 py-5 bg-red-500 rounded-xl inline-flex justify-center items-center gap-2.5 overflow-hidden"
            >
              <span className="justify-start text-neutral-50 text-base font-semibold font-['Pretendard'] leading-6">
                내 몰입 공간 만들기
              </span>
            </button>
          </div>

          <Image
            src="/landing/landingGroup.png"
            alt="landing group"
            width={906}
            height={500}
            className="w-full h-auto"
            priority
          />
        </div>
      </main>

      {landingSections.map((src, index) => (
        <div
          key={src}
          className="relative left-1/2 -translate-x-1/2 w-screen max-w-none"
        >
          <Image
            src={src}
            alt={`landing section ${index + 1}`}
            width={1920}
            height={1080}
            className="block w-full h-auto"
            priority
          />
        </div>
      ))}
      <section
        ref={focusSectionRef}
        className="w-full pt-[240px] pb-[240px] flex flex-col justify-center items-center"
      >
        <Image
          src="/character.svg"
          alt="slogan"
          width={112}
          height={224}
          priority
        />
        <div className="mt-10 text-center justify-start text-neutral-900 text-4xl font-semibold font-['Pretendard'] leading-[48px]">
          혼자서는 어려웠던 몰입,
          <br />
          이제 모각작에서 함께해요!
        </div>

        <div className="mt-10 gap-4 flex flex-col">
          <LoginButton type="google" />
          <LoginButton type="kakao" />
        </div>
      </section>
    </div>
  );
}
