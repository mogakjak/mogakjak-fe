"use client";

import { useBlockPageNavigation } from "@/app/_hooks/block/useBlockPageNavigation";

export default function NavigationBlocker() {
  // useBlockPageNavigation 내부에서 isRunning을 체크하므로 항상 호출
  useBlockPageNavigation();
  return null;
}
