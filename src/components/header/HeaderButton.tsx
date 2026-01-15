"use client";

import { useRouter, usePathname } from "next/navigation";
import { useBlockNavigation } from "@/app/_hooks/block/useBlockNavigation";
import { useEffect, useTransition } from "react";
import Link from "next/link";

interface HeaderButtonProps {
  text: string;
  href: string;
}

export default function HeaderButton({ text, href }: HeaderButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const isActive = pathname === href;

  // 페이지 미리 로드 (성능 최적화)
  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  const { handleClick } = useBlockNavigation(() => {
    startTransition(() => {
      router.push(href);
    });
  });

  return (
    <Link
      href={href}
      onClick={(e) => {
        e.preventDefault();
        handleClick(e);
      }}
      aria-label={text}
      className={
        "w-30 h-10 rounded-3xl text-body1-16M transition-all border flex items-center justify-center " +
        (isActive
          ? "border-red-500 bg-red-500 text-white"
          : "text-gray-600 border-gray-200 hover:text-red-500 hover:border-red-500") +
        (isPending ? " opacity-70" : "")
      }
    >
      {text}
    </Link>
  );
}

