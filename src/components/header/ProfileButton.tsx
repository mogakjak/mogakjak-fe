"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useBlockNavigation } from "@/app/_hooks/block/useBlockNavigation";
import { useProfile } from "@/app/_hooks/mypage/useProfile";

export default function ProfileButton() {
  const pathname = usePathname();
  const router = useRouter();
  const isMypage = pathname === "/mypage";
  const { handleClick } = useBlockNavigation(() => {
    router.push("/mypage");
  });

  const { data: profile } = useProfile();

  return (
    <Link
      href="/mypage"
      onClick={handleClick}
      aria-current={isMypage ? "page" : undefined}
      className={`relative w-10 h-10 block rounded-full overflow-hidden border-2 transition-colors duration-200
        ${isMypage ? "border-red-500" : "border-gray-300"}
      `}
    >
      {profile?.imageUrl ? (
        <Image
          src={profile.imageUrl}
          alt="프로필 이미지"
          fill
          className="object-cover"
        />
      ) : (
        <>
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
        </>
      )}
    </Link>
  );
}
