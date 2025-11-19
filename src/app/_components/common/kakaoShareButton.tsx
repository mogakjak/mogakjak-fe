"use client";

import Image from "next/image";
import { useEffect } from "react";

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: {
          objectType: string;
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          };
          buttons?: Array<{
            title: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          }>;
          installTalk?: boolean;
        }) => void;
      };
    };
  }
}

interface KakaoShareButtonProps {
  title?: string;
  description?: string;
  imageUrl?: string;
}

export default function KakaoShareButton({
  title = "모각작",
  description = "함께 몰입하며 꾸준함을 만드는 힘을 경험해 보세요!",
  imageUrl = "https://mogakjak-fe.vercel.app/thumbnail.png",//수정 예정
}: KakaoShareButtonProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
      if (kakaoKey) {
        window.Kakao.init(kakaoKey);
      }
    }
  }, []);

  const handleKakaoShare = (): void => {
    if (typeof window === "undefined" || !window.Kakao) {
      console.error("Kakao SDK가 로드되지 않았습니다.");
      return;
    }

    if (!window.Kakao.isInitialized()) {
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
      if (!kakaoKey) {
        console.error("카카오 JavaScript 키가 설정되지 않았습니다.");
        return;
      }
      window.Kakao.init(kakaoKey);
    }
    const currentUrl = "https://mogakjak-fe.vercel.app";

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl,
        link: {
          mobileWebUrl: currentUrl,
          webUrl: currentUrl,
        },
      },
      buttons: [
        {
          title: "모각작 시작하기",
          link: {
            mobileWebUrl: currentUrl,
            webUrl: currentUrl,
          },
        },
      ],
      installTalk: true,
    });
  };

  return (
    <button
      onClick={handleKakaoShare}
      className="self-stretch h-12 px-10 py-4 bg-yellow-400 rounded-2xl inline-flex justify-center items-center gap-2 transition active:scale-[0.99] disabled:opacity-70"
    >
      <div className="w-6 h-6 relative overflow-hidden">
        <Image
          src="/Icons/kakao.svg"
          alt="카카오톡"
          width={24}
          height={24}
          className="w-5 h-5"
        />
      </div>
      <div className="justify-center text-neutral-900 text-base font-medium font-['Pretendard'] leading-6">
        카카오톡 &apos;나에게&apos; 보내기
      </div>
    </button>
  );
}

