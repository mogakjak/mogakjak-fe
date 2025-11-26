"use client";

import Image from "next/image";
import { useState } from "react";

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
  imageUrl =  "https://mogakjak-fe.vercel.app/thumbnailMessage.jpeg",
}: KakaoShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 카카오 SDK를 동적으로 로드하는 함수
  const loadKakaoSdk = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Window is not defined"));
        return;
      }

      // 이미 로드되어 있으면 초기화만 수행
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
          if (kakaoKey) {
            window.Kakao.init(kakaoKey);
          }
        }
        resolve();
        return;
      }

      // SDK 스크립트 동적 로드
      const script = document.createElement("script");
      script.src = "https://developers.kakao.com/sdk/js/kakao.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      
      script.onload = () => {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
        if (kakaoKey && window.Kakao) {
          window.Kakao.init(kakaoKey);
          resolve();
        } else {
          reject(new Error("Kakao SDK initialization failed"));
        }
      };
      
      script.onerror = () => {
        setIsLoading(false);
        reject(new Error("Failed to load Kakao SDK"));
      };

      document.head.appendChild(script);
      setIsLoading(true);
    });
  };

  const handleKakaoShare = async (): Promise<void> => {
    try {
      // SDK가 로드되지 않았으면 먼저 로드
      if (!window.Kakao) {
        await loadKakaoSdk();
      }

      if (typeof window === "undefined" || !window.Kakao) {
        alert("카카오톡 공유 기능을 사용할 수 없습니다.");
        return;
      }

      if (!window.Kakao.isInitialized()) {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
        if (!kakaoKey) {
          alert("카카오톡 공유 오류입니다. 관리자에게 문의해주세요.");
          return;
        }
        window.Kakao.init(kakaoKey);
      }
      
      const currentUrl = process.env.NEXT_PUBLIC_REDIRECT_URI || "https://mogakjak-fe.vercel.app";
      
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
    } catch (error) {
      console.error("Kakao SDK load error:", error);
      setIsLoading(false);
      alert("카카오톡 공유 기능을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <button
      onClick={handleKakaoShare}
      disabled={isLoading}
      aria-label="카카오톡 나에게 보내기"
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

