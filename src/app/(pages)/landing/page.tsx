"use client";

import Image from "next/image";
import KakaoShareButton from "@/app/(pages)/landing/_components/kakaoShareButton";

export default function Landing() {
  const handleInstagramClick = () => {
    window.open("https://www.instagram.com/mogakjak_official/", "_blank");
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <main className="w-full py-7 min-h-screen bg-white flex flex-col items-center justify-evenly">
      <div className="flex flex-col justify-start items-center gap-4">
        <div className="flex flex-col justify-start items-center gap-2">
          <Image
            src="/Icons/logoSlogan.svg"
            alt="slogan"
            width={188}
            height={182}
          />
        </div>
        <p className="text-center text-zinc-600 text-sm font-normal font-['Pretendard'] leading-5">
          함께 몰입하며 꾸준함을 만드는 힘을 경험해 보세요!
        </p>
      </div>
      <div className="mx-4 px-6 py-8 bg-gray-100 rounded-2xl flex flex-col justify-start items-center gap-10">
        <div className="flex flex-col justify-start items-center gap-2">
          <p className="text-center text-zinc-700 text-base font-semibold font-['Pretendard'] leading-6">
            모각작에 오신 것을 환영합니다!
          </p>
          <div className="text-center text-zinc-700 text-sm font-normal font-['Pretendard'] leading-5">
            모각작은{" "}
            <span className="text-red-500 text-sm font-semibold font-['Pretendard']">
              PC 환경
            </span>
            에 최적화되어 있어요.
            <br />
            집에서 바로 시작할 수 있게 링크를 보내드릴게요!
          </div>
        </div>

        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          <KakaoShareButton />

          <div className="self-stretch inline-flex justify-center items-center gap-2">
            <div className="flex-1 h-0 border-t border-neutral-300"></div>
            <div className="text-gray-400 text-xs font-normal font-['Pretendard'] leading-4">
              또는
            </div>
            <div className="flex-1 h-0 border-t border-neutral-300"></div>
          </div>

          <button
            onClick={handleInstagramClick}
            className="self-stretch h-12 px-10 py-4 bg-white rounded-2xl border border-gray-200 inline-flex justify-center items-center gap-2 transition active:scale-[0.99]"
          >
            <div className="w-6 h-6 relative">
              <Image
                src="/Icons/Instagram.svg"
                alt="인스타그램"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </div>
            <div className="text-neutral-900 text-base font-medium font-['Pretendard'] leading-6">
              인스타그램 구경하기
            </div>
          </button>
        </div>
      </div>
    </main>
    </div>
  );
}
