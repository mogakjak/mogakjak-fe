"use client";

import { usePathname } from "next/navigation";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
import Header from "../Header";

interface ConditionalHeaderProps {
  isMobile: boolean;
}

export default function ConditionalHeader({
  isMobile,
}: ConditionalHeaderProps) {
  const { isLoggedIn, ready } = useAuthState();
  const pathname = usePathname();

  if (!ready || !isLoggedIn) return null;
  if (pathname === "/" && isMobile) return null;
  if (pathname === "/landing") return null;
  if (pathname?.startsWith("/invite")) return null;

  return <Header />;
}
