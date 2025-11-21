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
    title: "모각작",
    description: "함께 몰입하며 꾸준함을 만드는 모각작 커뮤니티",
    url: "https://mogakjak-fe.vercel.app",
    siteName: "모각작",
    images: [
      {
        url: "https://mogakjak-fe.vercel.app/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "모각작",
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
      <body className="mx-auto w-full min-h-screen flex flex-col items-center bg-gray-100 overflow-x-hidden">
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
        <Script
          src="https://developers.kakao.com/sdk/js/kakao.js"
          strategy="afterInteractive"
        />

        <Providers>
          <WithMobileDetection>
            {({ isMobile }) => <ConditionalHeader isMobile={isMobile} />}
          </WithMobileDetection>
          <div className="flex-1 flex justify-center bg-gray-100 w-full h-full">
            <div className="px-9 h-full w-[1440px]">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
