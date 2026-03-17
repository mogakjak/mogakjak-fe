"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getPendingInviteGroupId,
  removePendingInviteGroupId,
} from "@/app/_lib/pendingInvite";

export default function InviteRedirectHandler() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname !== "/") return;

    const inviteGroupId = getPendingInviteGroupId();
    if (inviteGroupId) {
      removePendingInviteGroupId();
      router.replace(`/invite/${inviteGroupId}`);
    }
  }, [pathname, router]);

  return null;
}

