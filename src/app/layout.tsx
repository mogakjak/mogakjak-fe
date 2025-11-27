import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import dynamic from "next/dynamic";

// 동적 import로 변경하여 초기 번들 크기 줄이기
const Providers = dynamic(() => import("./_providers/providers"), {
  ssr: true,
});

// NotificationRoot는 hydration 이후에만 로드
// ssr: false는 NotificationRoot 내부에서 처리
const NotificationRoot = dynamic(
  () => import("./_components/common/notificationRoot"),
  {
    ssr: true, // SSR에서는 children만 렌더링
  }
);

const ConditionalHeader = dynamic(
  () => import("@/components/header/ConditionalHeader"),
  { ssr: true }
);

import WithMobileDetection from "@/app/_utils/isMobileUserAgent";

export const metadata: Metadata = {
  title: "모각작 - 함께 몰입하며 꾸준함을 만드는 커뮤니티",
  description: "함께 몰입하며 꾸준함을 만드는 모각작 커뮤니티",
  keywords: [
    "모각작",
    "몰입",
    "집중",
    "타이머",
    "공부",
    "스터디",
    "커뮤니티",
    "프로젝트",
    "개발",
    "학습",
  ],
  authors: [{ name: "모각작" }],
  creator: "모각작",
  publisher: "모각작",
  metadataBase: new URL("https://mogakjak-fe.vercel.app"),
  verification: {
    google: "hZ8V-qZoPvHPnWwi2iSRcgCfgzKoTgtFg_g7gqwuWXU",
  },
  openGraph: {
    title: "모각작",
    description: "함께 몰입하며 꾸준함을 만드는 모각작 커뮤니티",
    url: "https://mogakjak-fe.vercel.app",
    siteName: "모각작",
    images: [
      {
        url: "https://mogakjak-fe.vercel.app/thumbnail.png?v=2",
        width: 1200,
        height: 630,
        alt: "모각작",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "모각작",
    description: "함께 몰입하며 꾸준함을 만드는 모각작 커뮤니티",
    images: ["https://mogakjak-fe.vercel.app/thumbnail.png?v=2"],
  },
  icons: {
    icon: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" style={{ colorScheme: "light" }}>
      <body className="mx-auto w-full min-h-screen flex flex-col items-center bg-gray-100 overflow-x-hidden">
        {/* Google Tag Manager - lazyOnload로 지연 로드 */}
        <Script
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=G-T8JCTVV834"
        />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-T8JCTVV834', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        <Providers>
          <WithMobileDetection>
            {({ isMobile }) => <ConditionalHeader isMobile={isMobile} />}
          </WithMobileDetection>
          <NotificationRoot>
            <div className="flex-1 flex justify-center bg-gray-100 w-full min-h-screen">
              <div className="px-9 pb-[60px] min-h-screen w-[1440px] max-w-full">
                {children}
              </div>
            </div>
          </NotificationRoot>
        </Providers>
      </body>
    </html>
  );
}
