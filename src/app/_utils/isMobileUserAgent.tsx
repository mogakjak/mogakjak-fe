import { headers } from "next/headers";
import { ReactNode } from "react";

type WithMobileDetectionProps = {
  children: (args: { isMobile: boolean; ua: string }) => ReactNode;
};

export default async function WithMobileDetection({
  children,
}: WithMobileDetectionProps) {
  const headerList = await headers();
  const ua = headerList.get("user-agent") ?? "";
  const isMobile = isMobileUserAgent(ua);
  return <>{children({ isMobile, ua })}</>;
}

export function isMobileUserAgent(ua: string): boolean {
  return /iPhone|iPad|iPod|Android|Mobile|Windows Phone/i.test(ua);
}
