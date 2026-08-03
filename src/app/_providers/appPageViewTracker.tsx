"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";

function normalizePageName(pathname: string): string {
  if (pathname === "/") return "home";
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment || "home";
}

export default function AppPageViewTracker() {
  const pathname = usePathname();
  const fromPageRef = useRef<string>("direct");
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === lastPathRef.current) return;

    const pageName = normalizePageName(pathname);
    sendGAEvent("event", "app_page_view", {
      page_name: pageName,
      from_page: fromPageRef.current,
    });

    fromPageRef.current = pageName;
    lastPathRef.current = pathname;
  }, [pathname]);

  return null;
}
