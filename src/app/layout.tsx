import type { Metadata } from "next";
import "./globals.css";
import Providers from "./_providers/providers";
import ConditionalHeader from "@/components/header/ConditionalHeader";

export const metadata: Metadata = {
  title: "모각작",
  description: "모각작",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="mx-auto w-full flex flex-col min-h-screen items-center bg-gray-100 overflow-x-hidden">
        <Providers>
          <ConditionalHeader />
          <div className="px-[36px] bg-gray-100 w-full ">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
