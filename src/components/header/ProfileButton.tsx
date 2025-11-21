"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileButton() {
  const pathname = usePathname();
  const isMypage = pathname === "/mypage";

  return (
    <Link
      href="/mypage"
      aria-current={isMypage ? "page" : undefined}
      className="relative w-10 h-10 block group"
    >
      <Image
        src="/profileDefault.svg"
        alt="프로필 기본"
        fill
        priority={false}
        className={`object-contain transition-opacity duration-200
          ${isMypage ? "opacity-0" : "opacity-100 group-hover:opacity-0"}
        `}
      />
      <Image
        src="/profileSelected.svg"
        alt="프로필 선택"
        fill
        className={`object-contain transition-opacity duration-200
          ${isMypage ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
        `}
      />
    </Link>
  );
}
