import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "./_providers/providers";
import ConditionalHeader from "@/components/header/ConditionalHeader";
import WithMobileDetection from "@/app/_utils/isMobileUserAgent";

export const metadata: Metadata = {
  title: "모각작",
  description: "함께 몰입하며 꾸준함을 만드는 모각작 커뮤니티",
  openGraph: {
    title: "김이름님이 `몰딥브 팀` 으로 초대했어요!",
    description: "타이머로 함께 몰입하며 꾸준함을 만드는 힘을 경험해 보세요!",
    url: "https://mogakjak-fe.vercel.app",
    siteName: "모각작",
    images: [
      {
        url: "https://mogakjak-fe.vercel.app/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "모각작 초대",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="mx-auto w-full flex flex-col min-h-screen items-center bg-gray-100 overflow-x-hidden">
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-T8JCTVV834"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
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
          <div className="flex items-center justify-center bg-gray-100 w-full">
            <div className="px-9 w-[1440px]">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
