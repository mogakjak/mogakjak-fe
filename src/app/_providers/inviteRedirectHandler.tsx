"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function InviteRedirectHandler() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname !== "/") return;

    const inviteGroupId = sessionStorage.getItem("mg_invite_groupid");
    if (inviteGroupId) {
      sessionStorage.removeItem("mg_invite_groupid");
      router.replace(`/invite/${inviteGroupId}`);
    }
  }, [pathname, router]);

  return null;
}
