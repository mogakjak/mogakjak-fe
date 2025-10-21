import type { Metadata } from "next";
import "./globals.css";
import Providers from "./_providers/providers";

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
        <div className="bg-gray-100 w-full">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
