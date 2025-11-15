"use client";

import { useRouter, usePathname } from "next/navigation";

interface HeaderButtonProps {
  text: string;
  href: string;
}

export default function HeaderButton({ text, href }: HeaderButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className={
        "w-30 h-10 rounded-3xl text-body1-16M transition-colors border " +
        (isActive
          ? "border-red-500 bg-red-500 text-white"
          : "text-gray-600 border-gray-200 hover:text-red-500 hover:border-red-500")
      }
    >
      {text}
    </button>
  );
}
